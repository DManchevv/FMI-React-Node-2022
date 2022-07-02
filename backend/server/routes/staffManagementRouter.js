const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const db = utils.db;
const mode = utils.mode;
const upload = utils.upload;
const uploadXLSX = utils.uploadXLSX;
const poolAdmin = utils.poolAdmin;
const checksum = utils.checksum;
const unlinkAsync = utils.unlinkAsync;
const fs = require('fs');
const request = require('request-promise');
const router = express.Router();
const excel = require('exceljs');
const globalConf = require('../config/global.conf.js');
const PAGESIZE = globalConf.pagesize;

router.get("/", asyncErrorHandler(async (req, res) => {
    const staffNumber = await poolAdmin.query(
        `SELECT COUNT (*) FROM staff`
    );

    res.render("staff_management", { totalUsers: staffNumber.rows[0].count });
}));

router.get("/get-user/:id", asyncErrorHandler(async(req,res) => {
    const id = req.params.id;

    const user = await db.query(
        `SELECT s.id, s.username, s.email
         FROM staff s
         WHERE s.id = $1`,
         [id]
    );

    assert(user.length === 1, "No user with provided ID found!");

    res.status(globalConf.http.OK).json(user[0]);
}));

router.get("/get-all", asyncErrorHandler(async (req, res) => {
    const allStaff = await poolAdmin.query(
        `SELECT s.id, s.username, s.password, s.email
            FROM staff s`
    );

    res.json(allStaff.rows);
}));

router.post("/", asyncErrorHandler(async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;

        const usernameRegex = /^(?=[a-zA-Z0-9._]{6,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
        const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (usernameRegex.test(username) === false) {
            res.sendStatus(globalConf.http.CUSTOM_CLIENT_ERR);
            return;
        }

        if (emailRegex.test(email) === false) {
            res.sendStatus(globalConf.http.CUSTOM_CLIENT_ERR);
            return;
        }

        let existingUser = await db.query(
            `SELECT *
             FROM staff
             WHERE username = $1
                OR email = $2`,
            [username, email]
        );

        if (existingUser.length > 0) {
            res.sendStatus(400);
            return;
        }

        db.tx({ mode }, async t => {
            const user = await t.any(`INSERT 
                         INTO staff(username, password, email)
                         VALUES($1, $2, $3) RETURNING id`,
                [username, password, email]
            );

            return user;
        })
            .then(data => {
                console.log(data);
                res.sendStatus(201);
                return;
            })
            .catch(error => {
                console.error(error);
                res.sendStatus(500);
                return;
            });

    } catch (err) {
        throw Error(err);
    }
}));

router.put('/:id', asyncErrorHandler(async (req, res) => {
    let id = req.params.id;
    let username = req.body.username;
    let email = req.body.email;

    const updatedUser = await db.query(
        `UPDATE staff
         SET username=$1,
             email=$2
         WHERE id=$3`,
         [username, email, id]
    );

    res.sendStatus(globalConf.http.OK);
}));

router.delete('/:id', asyncErrorHandler(async (req, res) => {
    let id = req.params.id;

    let deletedUser = await db.query(
        `DELETE 
         FROM staff
         WHERE id=$1`,
         [id]
    );

    console.log(deletedUser);

    res.sendStatus(globalConf.http.OK);
}));

module.exports = router;