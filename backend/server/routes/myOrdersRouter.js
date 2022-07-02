const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const pool = utils.pool;
const router = express.Router();
const PAGESIZE = globalConf.pagesize;

router.get("/renderPage/:id", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.id;
    let userid = req.session.userid;

    const totalOrders = await pool.query(
        `SELECT COUNT (*) FROM orders
            WHERE user_id=$1`,
        [userid]
    );

    let totalPages = Math.ceil(totalOrders.rows[0].count / PAGESIZE);

    console.log(totalOrders.rows[0].count);
    console.log(totalPages);

    res.render("myOrders", {
        pageID: pageID,
        totalOrders: totalOrders.rows[0].count,
        totalPages: totalPages
    });
}));

router.get("/get-orders/:id", asyncErrorHandler(async (req, res) => {
    let userid = req.session.userid;
    let pageID = req.params.id;

    let orders = await pool.query(
        `SELECT o.id, 
                o.price,
                o.date,
                o.status,
                SUM(p.value) as discount
         FROM orders o
           FULL OUTER JOIN vouchers_orders vo ON vo.order_id = o.id
           FULL OUTER JOIN vouchers v ON vo.voucher_id = v.id
           FULL OUTER JOIN promotions p ON p.id = v.promotion_id
         WHERE o.user_id = $1 
         GROUP BY o.id
         ORDER BY o.date DESC 
         LIMIT $2 
         OFFSET $3`,
        [userid, PAGESIZE, (pageID - 1) * PAGESIZE]
    );

    res.json(orders.rows);
}));

router.get("/order-details/:id", asyncErrorHandler(async (req, res) => {
    let orderId = req.params.id;

    res.render("orderDetails", { id: orderId });
}));

router.post("/get-specific-order", asyncErrorHandler(async (req, res) => {
    let orderID = req.body.orderID;

    let order = await pool.query(
        `SELECT o.id, 
                o.date, 
                o.user_id, 
                o.type, 
                o.products, 
                o.price, 
                o.currency, 
                o.status,
                SUM(p.value) as vouchers
            FROM orders o
             FULL OUTER JOIN vouchers_orders vo ON vo.order_id = o.id
             FULL OUTER JOIN vouchers v ON vo.voucher_id = v.id
             FULL OUTER JOIN promotions p ON p.id = v.promotion_id
            WHERE o.id = $1
            GROUP BY o.id`,
        [orderID]
    );

    res.json(order.rows[0]);
}));

router.post("/cancel-order", asyncErrorHandler(async (req, res) => {
    const cancelledStatus = 3;

    if (!req.session.userid) {
        res.redirect('/');
        return;
    }

    let orderID = req.body.orderID;

    let order = await pool.query(
        "UPDATE orders SET status = $1 WHERE id=$2",
        [cancelledStatus, orderID]
    );

    if (order.rowCount == 1) {
        res.json({ success: true });
    }
    else {
        res.json({ success: false });
    }
}));

module.exports = router;