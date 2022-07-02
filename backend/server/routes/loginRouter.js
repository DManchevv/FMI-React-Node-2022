const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const salt = '83BA2D0914EDB3AA';
const fs = require('fs');
const utils = require('../utils');
const InvalidCredentialsError = require('../static/customErrors/InvalidCredentialsError');
const globalConf = require('../config/global.conf');
const db = utils.db;
const mode = utils.mode;
const transporter = utils.transporter;
const asyncErrorHandler = utils.asyncErrorHandler;
const session = utils.session;
const pool = utils.pool;

router.get('/', function (req, res) {
    let verify = req.query.v;

    if (verify === 't') {

    }
});

// Find user from login
router.post("/", asyncErrorHandler(async (req, res, next) => {
    const username = req.body.username;
    let password = req.body.password;
    let products = req.query.products == null ? null : JSON.parse(req.query.products);
    let quantity = req.query.quantity == null ? null : JSON.parse(req.query.quantity);
    let checkout = req.query.checkout == null ? false : true;

    let user = await pool.query(
        "SELECT user_id, password, verified FROM users WHERE username = $1",
        [username]
    );

    password = crypto.pbkdf2Sync(password, salt, globalConf.crypto.iterations,
        globalConf.crypto.keylength, globalConf.crypto.digest).toString('hex');

    if (user.rows.length > 0 && password == user.rows[0].password) {
        if (user.rows[0].verified == false) {
            const audit_message = "Опит за влизане на неверифициран потребител!";
            const audit_message_type_id = 1;
            const audit_user_id = user.rows[0].user_id;
            const audit_group = 'client';
            const audit_longmessage = `Потребител ${username} направи опит да влезе в
                                        системата преди да верифицира своят акаунт.`;

            utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
                                req.socket.remoteAddress, audit_user_id, audit_group);

            res.redirect(`/login/not-verified?uid=${user.rows[0].user_id}`);
            res.end();
            return;
        }
        else {
            session = req.session;
            session.userid = user.rows[0].user_id;
            session.username = username;
            session.role = "client";

            const audit_message = "Успешно влизане в системата!";
            const audit_message_type_id = 1;
            const audit_user_id = user.rows[0].user_id;
            const audit_group = 'client';
            const audit_longmessage = `Потребител ${username} успешно влезе във 
                                    Front-Office като ${audit_group}.`;

            utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
                req.socket.remoteAddress, audit_user_id, audit_group);

            req.session.save(async function (err) {
                if (err == null) {
                    if (products) {
                        for (let i = 0; i < products.length; i++) {
                            await db.tx({ mode }, async t => {
                                await t.any(
                                    `INSERT 
                                    INTO userscartproducts (user_id, product_id, quantity)
                                    VALUES ($1, $2, $3)`,
                                    [user.rows[0].user_id, products[i], quantity[i]]
                                )
                                .catch(err => {
                                    console.error(err);
                                });
                            })
                            .catch(err => {
                                console.error(err);
                                res.redirect("/shopcart");
                                res.end();
                                return;
                            });
                        }
                    }
                    else {
                        res.sendStatus(200);
                        res.end();
                        return;
                    }
                }
                else {
                    //   return res.sendStatus(globalConf.http.httpServerErr).json({success: false});
                }
            });
        }
    }
    else {
        const audit_message = "Неуспешно влизане в системата!";
        const audit_message_type_id = 1;
        const audit_user_id = 0;
        const audit_group = 'guest';
        const audit_longmessage = `Ново неуспешно влизане във Front-Office
                                    от потребител с IP: ${req.socket.remoteAddress}.`;

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        throw new InvalidCredentialsError("Неправилно потребителско име или парола!");
    }
}));

// Not Verified template
router.get('/not-verified', (req, res) => {
    let uid = req.query.uid;

});

router.get('/not-verified/send-email', asyncErrorHandler(async (req, res) => {
    let user_id = req.query.uid;
    let user;
    let hash;
    let newHash;
    let config = JSON.parse(fs.readFileSync("./config/config.json"));

    await db.tx({ mode }, async t => {
        user = await t.any(
            `SELECT email
             FROM users
             WHERE user_id = $1`,
            [user_id]
        );

        hash = await t.any(
            `SELECT hash
             FROM emailhash
             WHERE user_id = $1`,
            [user_id]
        );

        if (hash.length == 0) {
            let hashString = crypto.randomBytes(128).toString('hex');
            let expirydate = new Date();
            expirydate.setHours(expirydate.getHours() + 2);
            newHash = await db.query(
                `INSERT 
                INTO emailhash (expirydate, hash, user_id)
                    VALUES ($1, $2, $3) RETURNING hash`,
                [expirydate, hashString, user_id]
            );

            return newHash[0].hash;
        }
        else {
            return hash[0].hash;
        }
    })
        .then(data => {
            transporter.sendMail({
                from: `${config.createMail.senderName} <${config.createMail.senderMail}>`, // sender address
                to: user[0].email, // list of receivers
                subject: "Verify email", // Subject line
                // text: "There is a new article. It's about sending emails, check it out!", // plain text body
                html: `Благодаря за регистрацията Ви. За да потвърдите имейла си, натиснете следния линк: <a href="https://${globalConf.ip}:${globalConf.port}/register/confirm-email?code=${data}&user=${user_id}">https://${globalConf.ip}:${globalConf.port}/register/confirm-email?code=${data}&user=${user_id}</a>.<br>
                   Ако Вие не сте се регистрирали в нашия сайт или този имейл е изпратен по погрешка, моля да ни извините и да игнорирате мейла.<br><br>
                   Поздрави,<br>
                   Екипът на Mitko-Eshop`
            }).then(info => {
                console.log({ info });
                res.sendStatus(200);
            }).catch(err => {
                console.log("SHEESH");
                console.error(err);
                res.sendStatus(500);
            });
        })
        .catch(err => {
            console.error(err);
        });
}));

module.exports = router;