const db = require('./_db')('postgres', '310320Mm');
const pool = require('./db')('client', 'client');
const poolAdmin = require('./db')('staff', 'staff');
const pgp = require('pg-promise')({});
const nodemailer = require('nodemailer');
const fs = require('fs');
const crypto = require('crypto');
const multer = require("multer");
const { promisify } = require('util');
const { TransactionMode, isolationLevel } = pgp.txMode;
const globalConf = require('./config/config.json');

const checksum = function(str, algorithm, encoding) {
    return crypto
        .createHash('md5')
        .update(str, 'utf-8')
        .digest('hex');
}

const mode = new TransactionMode({
    tiLevel: isolationLevel.repeatableRead,
    readOnly: false
});

const transporter = nodemailer.createTransport({
    secure: true,
    host: globalConf.nodemailer.host,
    port: globalConf.nodemailer.port,
    auth: {
        user: globalConf.nodemailer.user,
        pass: globalConf.nodemailer.pass,
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify().then(console.log).catch(console.error);

const unlinkAsync = promisify(fs.unlink);

const upload = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, 'static/images');
            },
            filename: function (req, file, cb) {
                fs.exists('static/images' + file.originalname, function (exists) {
                    if (exists) {
                        throw new Error("File Already exists!");
                    }
                    else {
                        cb(
                            null,
                            new Date().valueOf() +
                            '_' +
                            file.originalname
                        );
                    }
                });
            }
        }
    ),
});

const uploadXLSX = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, 'static/xlsx');
            },
            filename: function (req, file, cb) {
                fs.exists('static/xlsx' + file.originalname, function (exists) {
                    if (exists) {
                        throw new Error("File Already exists!");
                    }
                    else {
                        cb(
                            null,
                            new Date().valueOf() +
                            '_' +
                            file.originalname
                        );
                    }
                });
            }
        }
    ),
});

module.exports.db = db;
module.exports.mode = mode;
module.exports.transporter = transporter;
module.exports.pool = pool;
module.exports.poolAdmin = poolAdmin;
module.exports.unlinkAsync = unlinkAsync;
module.exports.checksum = checksum;
module.exports.upload = upload;
module.exports.uploadXLSX = uploadXLSX;

module.exports.asyncErrorHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(err => {
            next(err);
        });
};

module.exports.sendErrorResponse = function(req, res, status, message, err, errCode) {
    res.status(status).json({
        code: errCode,
        message: message,
        error: err
    });
}

module.exports.formatDate = function (inputDate) {
    let convertedDate = new Date(inputDate);
    const SECONDS = 60;
    const MILISECONDS = 1000;
    const offset = convertedDate.getTimezoneOffset();
    let localDate = new Date(convertedDate.getTime() - (offset * SECONDS * MILISECONDS)); 
    localDate = localDate.toISOString();
    let date = localDate.split('T')[0];
    let time = localDate.split('T')[1];
    time = time.split('.')[0];

    let formattedDate = date + " " + time;
    return formattedDate;
}

module.exports.isJsonObject = function(obj) {
    return obj !== undefined && obj !== null && obj.constructor == Object;
}

module.exports.insertAudit = async function(audit_message, audit_longmessage, audit_message_type_id,
                                      ip, audit_user_id, audit_user_group) {
    await db.tx({ mode }, async t => {
        await t.any(
            `INSERT 
                INTO auditlog (message, longmessage, message_type_id, ip, user_id, user_group)
                       VALUES ($1, $2, $3, $4, $5, $6)`,
            [audit_message, audit_longmessage, audit_message_type_id,
                ip, audit_user_id, audit_user_group]
        );
    })
    .then(() => {
        return true;
    })
    .catch(err => {
        console.error(err);
        return false;
    })

    return true;
}

module.exports.calculateShopcartVAT = async function calculateShopcartVAT(user_id, vouchersDiscount) {
    const prices = await db.query(
        `SELECT SUM(subtotal) as subtotal, MAX(currency) as currency,
                CAST((SUM(subtotal)*0.2) as NUMERIC(10,2)) as VAT,
                CAST((SUM(subtotal)*1.2 + $2) as NUMERIC(10,2)) as VATsubtotal
         FROM (
                SELECT p.price * up.quantity as subtotal, p.currency
                FROM products p
                INNER JOIN userscartproducts up ON up.product_id = p.product_id
                WHERE up.user_id=$1
              ) products`,
        [user_id, vouchersDiscount]
    );

    return prices;
}

