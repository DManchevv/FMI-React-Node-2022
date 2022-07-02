const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const salt = '83BA2D0914EDB3AA';
const fs = require('fs');
const utils = require('../utils');
const db = utils.db;
const mode = utils.mode;
const transporter = utils.transporter;
const asyncErrorHandler = utils.asyncErrorHandler;
const assert = require('assert');
const globalConf = require('../config/global.conf');
const pool = utils.pool;

router.get('/', (req, res) => {
    if (!req.session.userid) {
        let err = req.query.e;
        if (err != null) {
        }
        else {

        }
    }
    else {
        res.redirect('/');
    }
});

router.post("/", asyncErrorHandler(async (req, res) => {
    let password = req.body.password;
    const username = req.body.username;
    const email = req.body.email;
    const name = req.body.name;
    const surname = req.body.surname;
    const address = req.body.address;
    const sex = req.body.sex;
    const birthdate = req.body.birthdate;
    const country = req.body.countries;
    let role;

    let config = JSON.parse(fs.readFileSync("./config/config.json"));

    if (req.body.role == null) {
        role = "client";
    }
    else {
        role = req.body.role;
    }

    const findUsername = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (findUsername.rows.length > 0) {
        res.json("Username is already taken");
        return;
    }

    const findEmail = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (findEmail.rows.length > 0) {
        res.json("Email is already taken");
        return;
    }

    password = crypto
        .pbkdf2Sync(password, salt, globalConf.crypto.iterations,
            globalConf.crypto.keylength, globalConf.crypto.digest)
        .toString('hex');

    let newUser;

    db.tx({ mode }, async t => {
        newUser = await t.any(
            `INSERT 
             INTO users (username, password, email, address, firstname, lastname, sex, birthdate, citizenship)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id`,
            [username, password, email, address, name, surname, sex, birthdate, country]
        );

        return newUser[0].user_id;
    })
    .then(async data => {
        let hashString = crypto.randomBytes(globalConf.crypto.bytenumber).toString('hex');
        let expirydate = new Date();
        expirydate.setHours(expirydate.getHours() + 2);
        const newHash = await db.query(
            `INSERT 
        INTO emailhash (expirydate, hash, user_id)
            VALUES ($1, $2, $3)`,
            [expirydate, hashString, data]
        );

        transporter.sendMail({
            from: `${config.createMail.senderName} <${config.createMail.senderMail}>`, // sender address
            to: email, // list of receivers
            subject: "Verify email", // Subject line
            html: `Благодаря за регистрацията Ви. За да потвърдите имейла си, натиснете следния линк: <a href="https://${globalConf.ip}:${globalConf.port}/register/confirm-email?code=${hashString}&user=${data}">https://${globalConf.ip}:${globalConf.port}/register/confirm-email?code=${hashString}&user=${data}</a>.<br>
                Ако Вие не сте се регистрирали в нашия сайт или този имейл е изпратен по погрешка, моля да ни извините и да игнорирате мейла.<br><br>
                Поздрави,<br>
                Екипът на Mitko-Eshop`
        }).then(info => {
            console.log({ info });
        }).catch(err => {
            console.log(err);
        });
    })
    .catch(err => {
        console.log(err);
        res.redirect("/register?e=err");
    });

    res.redirect("/login?v=t");
}));

router.post("/check-credentials", asyncErrorHandler(async (req, res) => {
    let email = req.body.email;
    let username = req.body.username;
    const USERNAME_TAKEN = "Потребителското име е заето!";
    const EMAIL_TAKEN = "Електронната поща е заета!";
    const SUCCESSFULLY_REGISTERED = "";
    const SERVER_ERROR = "Възникна неочавана грешка! Моля опитайте отново!";

    db.tx({ mode }, async t => {
        let user = await t.any(
            `SELECT *
             FROM users
             WHERE username = $1`,
            [username]
        );

        let usermail = await t.any(
            `SELECT *
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (user.length > 0) {
            return {
                success: false,
                message: USERNAME_TAKEN
            }
        }
        else if (usermail.length > 0) {
            return {
                success: false,
                message: EMAIL_TAKEN
            }
        }
        else {
            return {
                success: true,
                message: SUCCESSFULLY_REGISTERED
            }
        }
    })
    .then(data => {
        res.json(data);
        res.end();
    })
    .catch(err => {
        console.error(err);
        res.json(SERVER_ERROR);
    });
}));

router.get("/confirm-email", asyncErrorHandler(async (req, res) => {
    let code = req.query.code;
    let user_id = req.query.user;

    let registeredUser = await db.query(
        `SELECT id 
         FROM emailhash
         WHERE hash=$1
           AND user_id=$2`,
        [code, user_id]
    );

    console.log(registeredUser);

    if (registeredUser.length > 0) {
        let updatedUser = await db.query(
            `UPDATE users
             SET verified=true
             WHERE user_id=$1
             RETURNING *`,
            [user_id]
        );

        console.log(updatedUser);

        assert(updatedUser.length === 1, "Възникна проблем!");
    }

    res.json({"success": "success"});

    res.end();
    return;
}));

module.exports = router;