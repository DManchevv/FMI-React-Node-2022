const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = utils.db;
const pool = utils.pool;
const asyncErrorHandler = utils.asyncErrorHandler;
const calculateShopcartVAT = utils.calculateShopcartVAT;
const assert = require('assert');
const dictionary = require('../dictionary');
const globalConf = require('../config/global.conf.js');

router.get("/", asyncErrorHandler(async (req, res) => {
    const currencyDictionary = dictionary.en.currency;
    let userid = req.session.userid;

    const shopcartProducts = await db.query(
        `SELECT p.name as product_name, 
                m.name as manufacturer_name, 
                c.name as category_name, 
                CAST ((p.price*1.2) as NUMERIC(10,2)) as product_price, 
                up.quantity as quantity, 
                p.product_id as product_id,
                p.currency as product_currency
        FROM products p
            INNER JOIN userscartproducts up ON p.product_id = up.product_id
            INNER JOIN categories c ON c.category_id = p.category
            INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
        WHERE up.user_id = $1`,
        [userid]
    );

    for (let i = 0; i < shopcartProducts.length; i++) {
        shopcartProducts[i].product_currency = currencyDictionary[shopcartProducts[i].product_currency];
    }

    const address = await db.query(
        `SELECT address 
            FROM users
            WHERE user_id = $1`,
        [userid]
    );

    const totals = await calculateShopcartVAT(userid, 0);

    assert(totals != null, "Error occured at VAT calculation!");

    let vouchers = await db.query(
        `SELECT v.id,
                v.expiration_date, 
                p.name, 
                p.value 
        FROM vouchers v 
            INNER JOIN promotions p ON p.id = v.promotion_id  
        WHERE user_id=$1
            AND v.expiration_date >= now()`,
        [userid]
    );

    if (vouchers.length == 0) {
        vouchers = null;
    }
    else {
        for (let i = 0; i < vouchers.length; i++) {
        vouchers[i].expiration_date = utils.formatDate(vouchers[i].expiration_date);
        }
    }

    res.json({
        data: shopcartProducts,
        address: address[0].address,
        totals: totals[0],
        vouchers: vouchers
    });
}));

// List all products in the user's shopcart
router.get("/get-products", asyncErrorHandler(async (req, res) => {
    let userid = req.session.userid;

    const shopcartProducts = await pool.query(
        `SELECT p.name as product_name, 
                m.name as manufacturer_name, 
                c.name as category_name, 
                CAST ((p.price*1.2) as NUMERIC(10,2)) as product_price, 
                up.quantity as quantity, 
                p.product_id as product_id 
            FROM products p
            INNER JOIN userscartproducts up ON p.product_id = up.product_id
            INNER JOIN categories c ON c.category_id = p.category
            INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
            WHERE up.user_id = $1`,
        [userid]
    );

    res.json(shopcartProducts.rows);
}));

// Update product quantity in shopcart
router.post("/product-quantity-update", asyncErrorHandler(async (req, res) => {
    const id = req.body.productid;
    const quantity = req.body.quantity;

    await pool.query(
        `UPDATE userscartproducts 
            SET quantity = $1 
            WHERE product_id = $2`,
        [quantity, id]
    );

    res.sendStatus(globalConf.http.CUSTOM_OK);
}));

router.get("/product-quantity-get", asyncErrorHandler(async (req, res) => {
    const productId = req.query.productid;

    const productQuantity = await pool.query(
        "SELECT quantity FROM products WHERE product_id = $1",
        [productId]
    );

    res.json(productQuantity.rows);
}));

router.get("/get-all-products-details", asyncErrorHandler(async (req, res) => {
    let userid = req.session.userid;
    let isError = false;
    let vouchers = req.query.vouchers;

    let products = await pool.query(
        "SELECT product_id, quantity FROM userscartproducts WHERE user_id = $1",
        [userid]
    );

    for (let i = 0; i < products.rows.length; i++) {
        let productQuantity = await pool.query(
            "SELECT quantity FROM products WHERE product_id = $1",
            [products.rows[i].product_id]
        );

        if (productQuantity.rows[0].quantity < products.rows[i].quantity) {
            if (!isError) {
                isError = true;
            }

            await pool.query(
                "UPDATE userscartproducts SET quantity = $1 WHERE product_id = $2",
                [productQuantity.rows[0].quantity, products.rows[i].product_id]
            )
        }
    }

    if (isError) {
        res.sendStatus(globalConf.http.SERVER_ERR);
    }
    else {
        res.sendStatus(globalConf.http.OK);
    }
}));

router.get("/calculate-total-price", asyncErrorHandler(async (req, res) => {
    const userid = req.session.userid;
    const totalSum = await pool.query(
        `SELECT SUM(u.quantity*CAST ((p.price*1.2) as NUMERIC(10,2))) FROM userscartproducts u
            INNER JOIN products p
            ON p.product_id = u.product_id
            WHERE u.user_id = $1`,
        [userid]
    );

    res.json(totalSum.rows[0]);
}));

router.get("/recalculate-total-price", asyncErrorHandler(async (req, res) => {
    const userid = req.session.userid;
    const totals = await calculateShopcartVAT(userid, 0);
    assert(totals.length == 1, "Error while getting total price of the order!");

    res.json(totals[0]);
}));

router.post("/add-discount", async (req, res) => {
  let userid = req.session.userid;
  let vouchersDiscount = req.body.vouchersDiscount;

  const totals = await calculateShopcartVAT(userid, vouchersDiscount);
  assert(totals.length == 1, "Error while getting total price of the order!");

  res.json(totals[0]);
});

module.exports = router;