const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const db = utils.db;
const poolAdmin = utils.poolAdmin;
const router = express.Router();
const globalConf = require('../config/global.conf.js');
const PAGESIZE = globalConf.pagesize;

router.get("/renderPage/:id", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.id;

    const totalUsers = await poolAdmin.query(
        "SELECT COUNT (*) FROM users"
    );

    let totalPages = Math.ceil(totalUsers.rows[0].count / PAGESIZE);

}));

// Get all users
router.get("/", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.id;

    const allUsers = await poolAdmin.query(
        `SELECT user_id, 
                username, 
                email, 
                address, 
                address2, 
                status,
                firstname,
                lastname,
                sex,
                birthdate,
                citizenship,
                verified
            FROM users 
            ORDER BY user_id`
    );

    res.json(allUsers.rows);
}));

// Update user's status
router.post("/update-user-status", asyncErrorHandler(async (req, res) => {
    let userID = req.body.userID;
    let val = req.body.val;

    const updateUser = await poolAdmin.query(
        "UPDATE users SET status=$1 WHERE user_id=$2",
        [val, userID]
    );

    if (updateUser.rowCount == 1) {
        res.json({ success: true, responseMessage: "Статусът е успешно обновен!" });
    }
    else {
        res.json({ success: false, responseMessage: "Възникна грешка по време на обновяване на статуса!" });
    }
}));

// Get only data filtered by the input fields above the table
router.post("/filter-table-data/:id", asyncErrorHandler(async (req, res) => {
    const notLetterOrDigitRegex = /^[a-zA-Z0-9]*$/;

    if (notLetterOrDigitRegex.test(req.body.idValue) === false ||
        notLetterOrDigitRegex.test(req.body.usernameValue) === false ||
        notLetterOrDigitRegex.test(req.body.emailValue) === false ||
        notLetterOrDigitRegex.test(req.body.address1Value) === false ||
        notLetterOrDigitRegex.test(req.body.address2Value) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Невалиден символ!" });
        return;
    }

    const columnDictionary = {
        0: "user_id",
        1: "firstname",
        2: "lastname",
        3: "birthdate",
        4: "username",
        5: "email",
        6: "sex",
        7: "citizenship",
        8: "address",
        9: "address2",
        10: "verified",
        11: "status"
    }

    let counter = req.params.id;
    let sortCol = req.body.sortCol;
    let ascending = (req.body.ascending == true) ? "ASC" : "DESC";
    let idSymbol = (req.body.idValue === '') ? "::TEXT LIKE" : req.body.idSymbol;
    let idValue = (req.body.idValue === '') ? "%" : req.body.idValue;
    let firstNameSybmol = (req.body.firstNameValue === '') ? "LIKE" : req.body.firstNameSybmol;
    let firstNameValue = (req.body.firstNameValue === '') ? "%" : req.body.firstNameValue;
    let lastNameSymbol = (req.body.lastNameValue === '') ? "LIKE" : req.body.lastNameSymbol;
    let lastNameValue = (req.body.lastNameValue === '') ? "%" : req.body.lastNameValue;
    let birthdateSymbol = (req.body.birthdateValue === '') ? "::TEXT LIKE" : req.body.birthdateSymbol;
    let birthdateValue = (req.body.birthdateValue === '') ? "%" : req.body.birthdateValue;
    let usernameSymbol = (req.body.usernameValue === '') ? "LIKE" : req.body.usernameSymbol;
    let usernameValue = (req.body.usernameValue === '') ? "%" : req.body.usernameValue;
    let emailSymbol = (req.body.emailValue === "") ? "LIKE" : req.body.emailSymbol;
    let emailValue = (req.body.emailValue === "") ? "%" : req.body.emailValue;
    let sexSymbol = (req.body.sexValue === "all") ? "::TEXT LIKE" : '=';
    let sex = (req.body.sexValue === "all") ? "%" : req.body.sexValue;
    let address1Symbol = (req.body.address1Value === "") ? "LIKE" : req.body.address1Symbol;
    let address1Value = (req.body.address1Value === "") ? "%" : req.body.address1Value;
    let address1NullCheck = (req.body.address1Value === "") ? "OR address IS NULL" : "";
    let address2Symbol = (req.body.address2Value === "") ? "LIKE" : req.body.address2Symbol;
    let address2Value = (req.body.address2Value === "") ? "%" : req.body.address2Value;
    let address2NullCheck = (req.body.address2Value === "") ? "OR address2 IS NULL" : "";
    let activeSymbol = (req.body.active === "all") ? "LIKE" : '=';
    let active = (req.body.active === "all") ? "%" : req.body.active;


    if (sortCol < 0 || sortCol > 11) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Невалидна колона за сортиране!" });
        return;
    }

    if (idValue != '%' && Number.isInteger(parseInt(idValue)) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Поредния номер може да бъде само число!" });
        return;
    }

    const filteredOrders = await db.query(
        `SELECT user_id,
                firstname,
                lastname,
                birthdate, 
                username,
                email, 
                sex,
                citizenship,
                address, 
                address2, 
                status,
                verified
            FROM users
            WHERE user_id $1:value $2
            AND firstname $3:value $4
            AND lastname $5:value $6
            AND birthdate $7:value $8
            AND username $9:value $10
            AND email $11:value $12
            AND sex $13:value $14
            AND (address $15:value $16 $17:raw)
            AND (address2 $18:value $19 $20:raw)
            AND status $21:value $22
            ORDER BY $23:name $24:value
            LIMIT $25
            OFFSET $26`,
        [idSymbol, idValue, firstNameSybmol, firstNameValue, lastNameSymbol, lastNameValue,
            birthdateSymbol, birthdateValue, usernameSymbol, usernameValue, emailSymbol,
            emailValue, sexSymbol, sex, address1Symbol, address1Value, address1NullCheck,
            address2Symbol, address2Value, address2NullCheck, activeSymbol, active,
            columnDictionary[sortCol], ascending, PAGESIZE, counter * PAGESIZE]
    )
        .catch(function (err) {
            console.error(err);
            res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Грешка при филтрирането на таблицата! Моля презаредете страницата!" });
            return;
        });

    res.status(globalConf.http.CUSTOM_OK).json(filteredOrders);
}));

module.exports = router;