const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const db = utils.db;
const poolAdmin = utils.poolAdmin;
const getSymbolFromCurrency = require('currency-symbol-map');
const globalConf = require('../config/global.conf.js');
const router = express.Router();
const PAGESIZE = globalConf.pagesize;

router.get("/renderPage/:id", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.id;

    assert(pageID !== null, "PageID is null!");

    let numberOfOrders = await poolAdmin.query(
        `SELECT COUNT (*) 
            FROM orders o`
    );

    let totalPages = Math.ceil(numberOfOrders.rows[0].count / PAGESIZE);

    res.render('order_management', { pageID: pageID, totalPages: totalPages, total: numberOfOrders.rows[0].count });

}));

// Get all orders based on offset and limit 60
router.get("/get-all/:id", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.id;

    assert(pageID !== null, "PageID is null!");

    const allOrders = await poolAdmin.query(
        `SELECT o.id, 
                s.name as status, 
                o.type, 
                o.user_id, 
                o.price, 
                o.currency, 
                o.products, 
                o.date 
            FROM orders o
                INNER JOIN statuses s ON o.status = s.id
            ORDER BY o.id
            LIMIT $1 
            OFFSET $2`,
        [PAGESIZE, (pageID - 1) * PAGESIZE]
    );

    for (let i = 0; i < allOrders.rows.length; i++) {
        allOrders.rows[i].currency = getSymbolFromCurrency(allOrders.rows[i].currency);
    }

    res.json(allOrders.rows);
}));

// Get buyer's details
router.get("/get-buyer-details/:id", asyncErrorHandler(async (req, res) => {
    let userID = req.params.id;

    assert(userID === null, "userID is null!");

    const userDetails = await poolAdmin.query(
        `SELECT user_id as id, username, email, address, address2 
            FROM users 
            WHERE user_id = $1`,
        [userID]
    );

    res.json(userDetails.rows[0]);
}));

// Update order's status
router.post("/update-order-status", asyncErrorHandler(async (req, res) => {
    let orderID = req.body.orderID;
    let newValue = req.body.val;

    assert(orderID === null, "orderID is null!");

    const statusName = await poolAdmin.query(
        "SELECT id FROM statuses WHERE name=$1",
        [newValue]
    );

    const updatedOrder = await poolAdmin.query(
        "UPDATE orders SET status = $1 WHERE id=$2",
        [statusName.rows[0].id, orderID]
    );

    if (updatedOrder.rowCount === 1) {
        res.json({ success: true, responseMessage: "Status was successfully updated!" });
    }
}));


// Get all current statuses
router.post("/get-all-valid-statuses", asyncErrorHandler(async (req, res) => {
    const currentStatus = req.body.currentStatus;
    let allowedStatuses;

    if (currentStatus == "NOT PAID") {
        allowedStatuses = ["SERVER ERROR", "ERROR DURING PAYMENT", "PAID", "SENT", "CANCELLED"];
    }
    else if (currentStatus == "SERVER ERROR") {
        return res.json({ final: true });
    }
    else if (currentStatus == "ERROR DURING PAYMENT") {
        return res.json({ final: true });
    }
    else if (currentStatus == "PAID") {
        allowedStatuses = ["COMPLETED", "SENT", "CANCELLED"];
    }
    else if (currentStatus == "CANCELLED") {
        return res.json({ final: true });
    }
    else if (currentStatus == "COMPLETED") {
        return res.json({ final: true });
    }
    else if (currentStatus == "EXPIRED") {
        return res.json({ final: true });
    }
    else if (currentStatus == "DELIVERED") {
        allowedStatuses = ["CANCELLED", "PAID"];
    }
    else if (currentStatus == "SENT") {
        allowedStatuses = ["CANCELLED", "DELIVERED", "DELIVERY PROBLEM"];
    }
    else if (currentStatus == "DELIVERY PROBLEM") {
        allowedStatuses = ["CANCELLED"];
    }

    const allStatuses = await poolAdmin.query(
        `SELECT name as status 
            FROM statuses
            WHERE name = ANY ($1)`,
        [allowedStatuses]
    );

    return res.json(allStatuses.rows);
}))

// Get all current types of orders
router.get("/get-all-types", asyncErrorHandler(async (req, res) => {
    const allTypes = await poolAdmin.query(
        "SELECT DISTINCT type FROM orders"
    );

    res.json(allTypes.rows);
}));

// Get all statuses
router.get("/get-all-statuses", asyncErrorHandler(async (req, res) => {
    const allStatuses = await poolAdmin.query(
        `SELECT *
            FROM statuses`
    );

    res.json(allStatuses.rows);
}));

// Get all currencies
router.get("/get-all-currencies", asyncErrorHandler(async (req, res) => {
    const allCurrencies = await poolAdmin.query(
        `SELECT DISTINCT currency
            FROM orders`
    );

    for (let i = 0; i < allCurrencies.rows.length; i++) {
        allCurrencies.rows[i].bgcurrency = getSymbolFromCurrency(allCurrencies.rows[i].currency);
    }

    res.json(allCurrencies.rows);
}));

router.post("/filter-table-data/:id", asyncErrorHandler(async (req, res) => {
    const DATELENGTH = 10;
    const columnDictionary = {
        0: "id",
        1: "date",
        2: "status",
        3: "type",
        4: "user_id",
        5: "price",
        6: "currency"
    }

    const notLetterOrDigitRegex = /^[,._a-zA-Z0-9]*$/;

    if (notLetterOrDigitRegex.test(req.body.idValue) === false ||
        notLetterOrDigitRegex.test(req.body.dateValue) === false ||
        notLetterOrDigitRegex.test(req.body.priceValue) === false ||
        notLetterOrDigitRegex.test(req.body.buyerIDValue) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Невалиден символ!" });
        return;
    }

    let counter = req.params.id;
    let sortCol = req.body.sortCol;
    let ascending = (req.body.ascending == true) ? "ASC" : "DESC";
    let idSymbol = (req.body.idValue === '') ? "::TEXT LIKE" : req.body.idSymbol;
    let idValue = (req.body.idValue === '') ? "%" : req.body.idValue
    let dateSymbol = (req.body.dateValue === '') ? "::TEXT LIKE" : req.body.dateSymbol;
    let dateValue = (req.body.dateValue === '') ? "%" : req.body.dateValue;
    let statusSymbol = (req.body.status === "all") ? "LIKE" : '=';
    let status = (req.body.status === "all") ? "%" : req.body.status;
    let typeSymbol = (req.body.type === "all") ? "LIKE" : '=';
    let type = (req.body.type === "all") ? "%" : req.body.type;
    let buyerIDSymbol = (req.body.buyerIDValue === "") ? "::TEXT LIKE" : req.body.buyerIDSymbol;
    let buyerIDValue = (req.body.buyerIDValue === "") ? "%" : req.body.buyerIDValue;
    let priceSymbol = (req.body.priceValue === "") ? "::TEXT LIKE" : req.body.priceSymbol;
    let priceValue = (req.body.priceValue === "") ? "%" : req.body.priceValue;
    let currencySymbol = (req.body.currency === "all") ? "LIKE" : '=';
    let currency = (req.body.currency === "all") ? "%" : req.body.currency;

    if (sortCol < 0 || sortCol > 6) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Невалидна колона за сортиране!" });
        return;
    }

    if (idValue != '%' && Number.isInteger(parseInt(idValue)) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Поредния номер може да бъде само число!" });
        return;
    }

    if ((dateValue != '%' && Number.isNaN(Date.parse(dateValue))) || (dateValue.length != DATELENGTH && dateValue.length != 1)) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Невалидна дата!" });
        return;
    }

    if (buyerIDValue != '%' && Number.isInteger(parseInt(buyerIDValue)) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Поредния номер на купувача може да бъде само число!" });
        return;
    }

    if (priceValue != '%' && Number.isInteger(parseInt(priceValue)) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Общата сума може да бъде само число!" });
        return;
    }

    const filteredOrders = await db.query(
        `SELECT o.id, 
                s.name as status, 
                o.type, 
                o.user_id, 
                o.price, 
                o.currency, 
                o.products, 
                o.date
            FROM orders o
            INNER JOIN statuses s ON o.status = s.id
            WHERE o.id $1:value $2
            AND o.date $3:value $4
            AND s.name $5:value $6
            AND o.type $7:value $8
            AND o.user_id $9:value $10
            AND o.price $11:value $12
            AND o.currency $13:value $14
            ORDER BY o.$15:name $16:value
            LIMIT $17
            OFFSET $18`,
        [idSymbol, idValue, dateSymbol, dateValue, statusSymbol, status, typeSymbol, type,
            buyerIDSymbol, buyerIDValue, priceSymbol, priceValue, currencySymbol, currency,
            columnDictionary[sortCol], ascending, PAGESIZE, counter * PAGESIZE]
    )
        .catch(function (err) {
            console.error(err);
            res.status(530).json({ error: "Грешка при филтрирането на таблицата! Моля презаредете страницата!" });
            return;
        });

    for (let i = 0; i < filteredOrders.length; i++) {
        filteredOrders[i].currency = getSymbolFromCurrency(filteredOrders[i].currency);
    }

    res.json(filteredOrders);
}));

module.exports = router;