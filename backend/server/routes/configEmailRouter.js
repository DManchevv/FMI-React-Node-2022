const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const fs = require('fs');
const router = express.Router();
const globalConf = require('../config/global.conf.js');
const pool = utils.pool;

function generateRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}

router.get("/", asyncErrorHandler(async (req, res) => {
    let message = (req.query.v == 't') ? "Промените са успешно запазени!" : null;
    let config = JSON.parse(fs.readFileSync('./config/config.json'));
    let errorMessage;
    if (req.query.s == "t") {
        errorMessage = "Заглавието на мейла не може да бъде празно!";
    }
    else if (req.query.m == "t") {
        errorMessage = "Невалиден имейл на подателя!";
    }
    else if (req.query.n == "t") {
        errorMessage = "Името на подателя трябва да съдържа не по-малко от 2 символа (само букви само на кирилица или само на латиница)!";
    }
    else {
        errorMessage = null;
    }

    res.status(200).json({
        subject: config.createMail.subject,
        header: config.createMail.header,
        footer: config.createMail.footer,
        senderMail: config.createMail.senderMail,
        senderName: config.createMail.senderName,
        borderWidth: config.createMail.tableborder,
        borderColor: config.createMail.borderColor,
        fontColor: config.createMail.color,
        backgroundColor: config.createMail.backgroundColor,
        firstCol: config.createMail.firstCol,
        secondCol: config.createMail.secondCol,
        thirdCol: config.createMail.thirdCol,
        fourthCol: config.createMail.fourthCol,
        message: message,
        errorMessage: errorMessage
    });
}));

router.post("/create-order/save-global-configurations", asyncErrorHandler(async (req, res) => {
    let config = JSON.parse(fs.readFileSync("./config/config.json"));
    let subject = req.body.subject;
    let header = req.body.header;
    let footer = req.body.footer;
    let senderMail = req.body.senderMail;
    let senderName = req.body.senderName;
    let firstCol = req.body.firstCol;
    let secondCol = req.body.secondCol;
    let thirdCol = req.body.thirdCol;
    let fourthCol = req.body.fourthCol;
    let senderMailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let senderNameRegex = /^[a-zA-Z]{2,}|[а-яА-Я]{2,}$/;

    if (subject == "") {
        res.redirect("/config-email/create-order?s=t");
        res.end();
        return;
    }

    if (senderMailRegex.test(senderMail) == false) {
        res.redirect("/config-email/create-order?m=t");
        res.end();
        return;
    }

    if (senderNameRegex.test(senderName) == false) {
        res.redirect("/config-email/create-order?n=t");
        res.end();
        return;
    }

    config.createMail.senderMail = senderMail;
    config.createMail.senderName = senderName;
    config.createMail.subject = subject;
    config.createMail.header = header;
    config.createMail.footer = footer;
    config.createMail.firstCol = firstCol;
    config.createMail.secondCol = secondCol;
    config.createMail.thirdCol = thirdCol;
    config.createMail.fourthCol = fourthCol;

    fs.writeFileSync("./config/config.json", JSON.stringify(config));

    res.redirect("/config-email/create-order?v=t");
}));

router.post("/create-order/save-extra-configurations", asyncErrorHandler(async (req, res) => {
    let borderColor = req.body.borderColor;
    let backgroundColor = req.body.backgroundColor;
    let fontColor = req.body.fontColor;
    let borderWidth = req.body.borderWidth;

    let config = JSON.parse(fs.readFileSync("./config/config.json"));

    config.createMail.borderColor = borderColor;
    config.createMail.backgroundColor = backgroundColor;
    config.createMail.color = fontColor;
    config.createMail.tableborder = borderWidth;

    fs.writeFileSync("./config/config.json", JSON.stringify(config));

    res.status(globalConf.http.CUSTOM_OK).json({
        message: "Конфигурациите са обновени успешно!"
    });

    res.end();
}));

router.get("/paid-order", asyncErrorHandler(async (req, res) => {
    let message = (req.query.v == 't') ? "Промените са успешно запазени!" : null;
    let config = JSON.parse(fs.readFileSync('./config/config.json'));
    let errorMessage;
    if (req.query.s == "t") {
        errorMessage = "Заглавието на мейла не може да бъде празно!";
    }
    else if (req.query.m == "t") {
        errorMessage = "Невалиден имейл на подателя!";
    }
    else if (req.query.n == "t") {
        errorMessage = "Името на подателя трябва да съдържа не по-малко от 2 символа (само букви само на кирилица или само на латиница)!";
    }
    else {
        errorMessage = null;
    }
}));

router.post("/paid-order/save-global-configurations", asyncErrorHandler(async (req, res) => {
    let config = JSON.parse(fs.readFileSync("./config/config.json"));
    let subject = req.body.subject;
    let header = req.body.header;
    let footer = req.body.footer;
    let senderMail = req.body.senderMail;
    let senderName = req.body.senderName;
    let firstCol = req.body.firstCol;
    let secondCol = req.body.secondCol;
    let thirdCol = req.body.thirdCol;
    let fourthCol = req.body.fourthCol;
    let senderMailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let senderNameRegex = /^[a-zA-Z]{2,}|[а-яА-Я]{2,}$/;

    if (subject == "") {
        res.redirect("/config-email/paid-order?s=t");
        res.end();
    }

    if (senderMailRegex.test(senderMail) == false) {
        res.redirect("/config-email/paid-order?m=t");
        res.end();
    }

    if (senderNameRegex.test(senderName) == false) {
        res.redirect("/config-email/paid-order?n=t");
        res.end();
    }

    config.paidMail.senderMail = senderMail;
    config.paidMail.senderName = senderName;
    config.paidMail.subject = subject;
    config.paidMail.header = header;
    config.paidMail.footer = footer;
    config.paidMail.firstCol = firstCol;
    config.paidMail.secondCol = secondCol;
    config.paidMail.thirdCol = thirdCol;
    config.paidMail.fourthCol = fourthCol;

    fs.writeFileSync("./config/config.json", JSON.stringify(config));

    res.redirect("/config-email/paid-order?v=t");
}));

router.post("/paid-order/save-extra-configurations", asyncErrorHandler(async (req, res) => {
    let borderColor = req.body.borderColor;
    let backgroundColor = req.body.backgroundColor;
    let fontColor = req.body.fontColor;
    let borderWidth = req.body.borderWidth;

    let config = JSON.parse(fs.readFileSync("./config/config.json"));

    config.paidMail.borderColor = borderColor;
    config.paidMail.backgroundColor = backgroundColor;
    config.paidMail.color = fontColor;
    config.paidMail.tableborder = borderWidth;

    fs.writeFileSync("./config/config.json", JSON.stringify(config));

    res.status(globalConf.http.CUSTOM_OK).json({
        message: "Конфигурациите са обновени успешно!"
    });

    res.end();
}));

router.get("/generate-bulk-data", asyncErrorHandler(async (req, res) => {
    for (let q = 0; q < 30000; q++) {
        let orderStatus = Math.floor(Math.random() * 10) + 1;

        let randomType = Math.floor(Math.random() * 2);
        let orderType;

        if (randomType == 0) {
            orderType = "online";
        }
        else {
            orderType = "cash";
        }

        let userID = await pool.query(
            "SELECT user_id FROM users " +
            "ORDER BY RANDOM() " +
            "LIMIT 2"
        );

        userID = userID.rows[0].user_id;

        let numberOfProducts = Math.floor(Math.random() * 20) + 1;

        let orderProducts = await pool.query(
            "SELECT product_id as id, name, price FROM products " +
            "ORDER BY RANDOM() " +
            "LIMIT $1",
            [numberOfProducts]
        );

        orderProducts = orderProducts.rows;

        let orderPrice = 0;

        for (let i = 0; i < orderProducts.length; i++) {
            orderPrice += parseFloat(orderProducts[i].price);
            orderProducts[i].quantity = Math.floor(Math.random() * 10) + 1;
        }

        let year = generateRandomNumber(2017, 2022);
        let month = generateRandomNumber(1, 13);
        let day;

        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            day = generateRandomNumber(1, 32);
        }
        else if (month == 4 || month == 6 || month == 9 || month == 11) {
            day = generateRandomNumber(1, 31);
        }
        else if (month == 2) {
            day = generateRandomNumber(1, 29);
        }

        if (month < 10) {
            month = month.toString();
            month = "0" + month;
        }

        if (day < 10) {
            day = day.toString();
            day = "0" + day;
        }

        let hours = generateRandomNumber(1, 24);
        if (hours < 10) {
            hours = hours.toString();
            hours = "0" + hours;
        }

        let minutes = generateRandomNumber(1, 60);

        if (minutes < 10) {
            minutes = minutes.toString();
            minutes = "0" + minutes;
        }

        let seconds = generateRandomNumber(1, 60);

        if (seconds < 10) {
            seconds = seconds.toString();
            seconds = "0" + seconds;
        }

        let date = year.toString() + "-" + month.toString() + "-" + day.toString() + " " + hours.toString() + ":" + minutes.toString() + ":" + seconds.toString();

        let orderProductsJSON = {};
        orderProductsJSON["products"] = orderProducts;
        orderProductsJSON = JSON.stringify(orderProducts);

        await pool.query(
            "INSERT INTO orders (status, type, user_id, price, products, date) VALUES ($1, $2, $3, $4, $5, $6)",
            [orderStatus, orderType, userID, orderPrice.toFixed(2), orderProductsJSON, date]
        );
    }
}));

module.exports = router;