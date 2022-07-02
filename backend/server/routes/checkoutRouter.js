const express = require('express');
const utils = require('../utils');
const transporter = utils.transporter;
const mode = utils.mode;
const db = utils.db;
const pool = utils.pool;
const asyncErrorHandler = utils.asyncErrorHandler;
const assert = require('assert');
const dictionary = require('../dictionary');
const fs = require('fs');
const router = express.Router();
const paypalOrderCreator = require('../paypalCreateOrder');
const paypalRequestHandler = require('../paypalTransaction');
const globalConf = require('../config/global.conf');

router.get("/", (req, res) => {
    if (!req.session.userid) {
        res.render('login', {
            message: "Моля влезте в системата, за да продължите с поръчката си!",
            isCheckout: true
        });
    }
    else {
        let vouchers = req.query.vouchers;
        res.render("checkout", {
          vouchers: vouchers
        });
    }
});

router.post("/calculate-final-price", async(req, res) => {
  if (!req.body.vouchers){
    res.json(0);
    res.end();
    return;
  }

  let vouchers = req.body.vouchers.split(',');

  for (let i = 0; i < vouchers.length; i++) {
    vouchers[i] = parseInt(vouchers[i]);
 
    if (vouchers[i] == NaN) {
      throw new Error("Error parsing voucher_id");
    }
  }

  let vouchersSum = await db.query(
    `SELECT SUM(p.value)
     FROM promotions p 
       JOIN vouchers v ON v.promotion_id = p.id
     WHERE v.id = ANY($1)`,
     [vouchers]
  );

  assert(vouchersSum != null, "Error while getting the sum of the vouchers!");

  console.log(vouchersSum);

  res.json(vouchersSum[0].sum);

  res.end();
});

router.post("/paypal", asyncErrorHandler(async (req, res) => {
    const NOT_PAID_STATUS = 2;
    const SENT_STATUS = 6;
    let config = JSON.parse(fs.readFileSync("./config/config.json"));
    let price = req.body.totalPrice;
    let discount = req.body.discount;
    let products = JSON.parse(JSON.parse(req.body.products).products);
    let userid = req.session.userid;
    let paypal = req.body.paypal;
    let orderID;
    let orderDate;

    let orderStatus = (paypal == "true") ? NOT_PAID_STATUS : SENT_STATUS;
    let orderType = (paypal == "true") ? "online" : "cash";

    for (let i = 0; i < products.length; i++) {
        let quantityCheck = await pool.query(
            "SELECT quantity FROM products WHERE product_id = $1",
            [products[i].id]
        );

        if (quantityCheck.rows[0].quantity < products[i].quantity) {
            res.json({ success: false });
            return;
        }
        
    }

    let vouchers = req.body.vouchers ? req.body.vouchers.split(',') : [];
    console.log(vouchers);


    for (let i = 0; i < vouchers.length; i++) {
      vouchers[i] = parseInt(vouchers[i]);

      if (vouchers[i] == NaN) {
        throw new ("Error while parsing voucher id");
      }
    }

    await db.tx({ mode }, async t => {
        const newOrder = await t.one(
            `INSERT 
             INTO orders (status, type, user_id, price, products) 
                  VALUES ($1, $2, $3, CAST($4 as NUMERIC(10,2)), $5) RETURNING id, date`,
            [orderStatus, orderType, userid, price, JSON.stringify(products)]
        );

        for (let i = 0; i < vouchers.length; i++) {
          let newPair = await t.none(
            `INSERT 
             INTO vouchers_orders (voucher_id, order_id)
                           VALUES ($1, $2)`,
             [vouchers[i], newOrder.id]
          );
        }

        return newOrder;
    })
    .then(data => {
        orderID = data.id;
        orderDate = utils.formatDate(data.date);
    })
    .catch(err => {
        console.error(err);
        throw new Error("Error while creating order!");
    });

    let cart = await pool.query(
        "DELETE FROM userscartproducts WHERE user_id = $1",
        [userid]
    );

    let userMail = await pool.query(
        `SELECT email
            FROM users
            WHERE user_id = $1`,
        [req.session.userid]
    );

    let JSONproducts = JSON.parse(JSON.stringify(products));
    let bulgarianDictionary = dictionary.en.email;

    let productsTableMessage = `<tr>
                                    <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${bulgarianDictionary[config.createMail.firstCol]}</td>
                                    <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${bulgarianDictionary[config.createMail.secondCol]}</td>
                                    <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${bulgarianDictionary[config.createMail.thirdCol]}</td>
                                    <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${bulgarianDictionary[config.createMail.fourthCol]}</td>
                                    <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">Валута</td>
                                </tr>`;

    let totalPrice = 0;

    for (let i = 0; i < JSONproducts.length; i++) {
        let valuesDictionary = {
            "name": JSONproducts[i].name,
            "quantity": JSONproducts[i].quantity,
            "singlePrice": (JSONproducts[i].price / JSONproducts[i].quantity).toFixed(2),
            "totalPrice": JSONproducts[i].price
        }

        productsTableMessage += `<tr>`;
        productsTableMessage += `<td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${valuesDictionary[config.createMail.firstCol]}</td>`;
        productsTableMessage += `<td style="padding:10px; text-align: right; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${valuesDictionary[config.createMail.secondCol]}</td>`;
        productsTableMessage += `<td style="padding:10px; text-align: right; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${valuesDictionary[config.createMail.thirdCol]}</td>`;
        productsTableMessage += `<td style="padding:10px; text-align: right; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${valuesDictionary[config.createMail.fourthCol]}</td>`;
        productsTableMessage += `<td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">лв.</td>`;
        productsTableMessage += `</tr>`;
        totalPrice += parseFloat(JSONproducts[i].price);
    }

    let mailSubject = config.createMail.subject;
    mailSubject = mailSubject.replace(/\$user/g, req.session.username);
    mailSubject = mailSubject.replace(/\$orderID/g, orderID);
    mailSubject = mailSubject.replace(/\$time/g, orderDate);

    let mailColor = config.createMail.color;

    let mailHeader = (config.createMail.header).replace(/\n/g, `</div><br><div style="color:${mailColor};">`);
    mailHeader = mailHeader.replace(/\$user/g, req.session.username);
    mailHeader = mailHeader.replace(/\$orderID/g, orderID);
    mailHeader = mailHeader.replace(/\$time/g, orderDate);

    let mailFooter = (config.createMail.footer).replace(/\n/g, `</div><br><div style="color:${mailColor};">`);
    mailFooter = mailFooter.replace(/\$user/g, req.session.username);
    mailFooter = mailFooter.replace(/\$orderID/g, orderID);
    mailFooter = mailFooter.replace(/\$time/g, orderDate);

    transporter.sendMail({
        from: `${config.createMail.senderName} <${config.createMail.senderMail}>`, // sender address
        to: userMail.rows[0].email, // list of receivers
        subject: mailSubject, // Subject line
        // text: "There is a new article. It's about sending emails, check it out!", // plain text body
        html: `<div style="background-color: ${config.createMail.backgroundColor}; color:${mailColor}; padding:2.5rem;">
                    <div style="color:${mailColor};">${mailHeader}</div>
                    <table border="${config.createMail.tableborder}" style="margin:1rem; border-color:${config.createMail.borderColor}">
                        ${productsTableMessage}
                        <tr>
                            <td colspan="3" style="text-align: right; padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};"> Цена на поръчката без ДДС:</td>
                            <td style="text-align: right; padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${(totalPrice / 1.2).toFixed(2)}</td>
                            <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">лв.</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right; padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};"> ДДС:</td>
                            <td style="text-align: right; padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${(totalPrice - totalPrice / 1.2).toFixed(2)}</td>
                            <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">лв.</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right; padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};"> Цена на поръчката с ДДС:</td>
                            <td style="text-align: right; padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">${totalPrice.toFixed(2)}</td>
                            <td style="padding:10px; border-color:${config.createMail.borderColor}; border-width:${config.createMail.borderWidth};">лв.</td>
                        </tr>
                    </table>
                    <div style="color:${mailColor};">${mailFooter}</div>
                </div>`
    }).then(info => {
        console.log({ info });
    }).catch(console.error);

    const audit_message = "Създаване на поръчка!";
    const audit_message_type_id = 5;
    const audit_user_id = req.session.userid;
    const audit_group = 'client';

    db.tx({ mode }, async t => {
        await t.any(
            `INSERT 
                INTO auditlog (message, message_type_id, ip, user_id, user_group)
                        VALUES ($1, $2, $3, $4, $5)`,
            [audit_message, audit_message_type_id, req.socket.remoteAddress,
                audit_user_id, audit_group]
        );
    });

    console.log(paypal);

    if (paypal == true) {
        res.json({ path: "/checkout/paypal" });
    }
    else {
        for (let i = 0; i < products.length; i++) {
            let quantity = await pool.query(
                `SELECT quantity 
                 FROM products 
                 WHERE product_id=$1`,
                [products[i].id]
            );

            await pool.query(
                `UPDATE products 
                 SET quantity=$1 
                 WHERE product_id=$2`,
                [parseInt(quantity.rows[0].quantity) - parseInt(products[i].quantity), products[i].id]
            );
        }

        res.json({ path: "/myOrders/renderPage/1" });
    }
}));

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Paypal Gateway */
router.get("/paypal", (req, res) => {
    res.render("paypalGateway");
});

router.post("/paypal/create-order", (req, res, next) => {
    console.log("Creating order");
    paypalOrderCreator(req, res);

    const audit_message = "Създаване на PayPal поръчка!";
    const audit_message_type_id = 5;
    const audit_user_id = req.session.userid;
    const audit_group = 'client';

    db.tx({ mode }, async t => {
        await t.any(
            `INSERT 
                INTO auditlog (message, message_type_id, ip, user_id, user_group)
                        VALUES ($1, $2, $3, $4, $5)`,
            [audit_message, audit_message_type_id, req.socket.remoteAddress,
                audit_user_id, audit_group]
        );
    });
});

router.get("/paypal/continue-order/:id", asyncErrorHandler(async (req, res) => {
    const orderID = req.params.id;

    const order = await db.query(
        `SELECT payment_id 
            FROM orders 
            WHERE id = $1`,
        [orderID]
    );

    if (order[0].payment_id) {
        req.session.error = "Тази поръчка вече е платена!";
        res.redirect("/");
        return;
    }

    res.render("paypalGateway", { orderID: orderID });
}));

// Get the id of the last user's order
router.get("/paypal/orderid", asyncErrorHandler(async (req, res) => {
    let userid = req.session.userid;

    let orderId = await pool.query(
        "SELECT MAX(id) FROM orders WHERE user_id = $1",
        [userid]
    );

    res.json(orderId.rows);
}));

// Get the details of the last user's order
router.get("/paypal/get-order-details", asyncErrorHandler(async (req, res) => {
    let orderid = req.query.orderId;

    let order = await pool.query(
        "SELECT * FROM orders WHERE id = $1",
        [orderid]
    )

    res.json(order.rows);
}));

// Update order's status
router.post("/paypal/update-order-status", asyncErrorHandler(async (req, res) => {
    let newStatus = req.body.newStatus;
    let orderId = req.body.orderId;

    const updatedOrder = await pool.query(
        "UPDATE orders SET status = $1 WHERE id = $2",
        [newStatus, orderId]
    );

    console.log(orderId + " - " + newStatus);

    if (updatedOrder.rowCount == 1) {
        let products = await pool.query(
            "SELECT products FROM orders WHERE id=$1",
            [orderId]
        );

        products = products.rows[0].products;

        for (let i = 0; i < products.length; i++) {
            let quantity = await pool.query(
                "SELECT quantity FROM products WHERE product_id=$1",
                [products[i].id]
            );

            await pool.query(
                "UPDATE products SET quantity=$1 WHERE product_id=$2",
                [parseInt(quantity.rows[0].quantity) - parseInt(products[i].quantity), products[i].id]
            );
        }

        res.json({ success: true });
    }
    else {
        res.json({ success: false })
    }
}));

router.post("/paypal-capture-transaction", (req, res) => {
    const orderID = req.body.orderID;
    let config = JSON.parse(fs.readFileSync('./config/config.json'));
    console.log("Capture order");
    let userMail;
    let captureDate;

    paypalRequestHandler(req, res, db)
        .then(capture => {
            if (capture === false) {
                return res.status(270).json({
                    message: "Поръчката вече е платена!"
                });
            };

            captureDate = new Date(capture.headers.date);
            captureDate = utils.formatDate(captureDate.toISOString());
            const captureID = capture.result.purchase_units[0].payments.captures[0].id;

            db.tx({ mode }, async t => {
                const insertCapture = await t.any(
                    `INSERT
                    INTO externalpayments (payment_id, date, username, address, email, payer_id, country_code)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                    [captureID,
                        capture.headers.date,
                        capture.result.purchase_units[0].shipping.name.full_name,
                        capture.result.purchase_units[0].shipping.address.address_line_1,
                        capture.result.payer.email_address,
                        capture.result.payer.payer_id,
                        capture.result.purchase_units[0].shipping.address.country_code]
                );

                await t.any(
                    `UPDATE orders
                    SET payment_id = $1
                    WHERE id = $2`,
                    [insertCapture[0].id, orderID]
                );

                userMail = await t.any(
                    `SELECT email
                        FROM users
                        WHERE user_id = $1`,
                    [req.session.userid]
                );

                const audit_message = "Плащане на PayPal поръчка!";
                const audit_message_type_id = 5;
                const audit_user_id = req.session.userid;
                const audit_group = 'client';

                await t.any(
                    `INSERT 
                        INTO auditlog (message, message_type_id, ip, user_id, user_group)
                            VALUES ($1, $2, $3, $4, $5)`,
                    [audit_message, audit_message_type_id, req.socket.remoteAddress,
                        audit_user_id, audit_group]
                );

                return insertCapture;
            })
            .then(async () => {
                let products = await pool.query(
                    `SELECT products
                        FROM orders
                        WHERE id = $1`,
                    [orderID]
                );
                
                // console.log(products.rows);
                let JSONproducts = JSON.parse(JSON.stringify(products.rows[0].products));
                let bulgarianDictionary = dictionary.en.email;
                let productsTableMessage = `<tr>
                                                <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${bulgarianDictionary[config.paidMail.firstCol]}</td>
                                                <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${bulgarianDictionary[config.paidMail.secondCol]}</td>
                                                <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${bulgarianDictionary[config.paidMail.thirdCol]}</td>
                                                <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${bulgarianDictionary[config.paidMail.fourthCol]}</td>
                                                <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">Валута</td>
                                            </tr>`;

                let totalPrice = 0;
                for (let i = 0; i < JSONproducts.length; i++) {
                    let valuesDictionary = {
                        "name": JSONproducts[i].name,
                        "quantity": JSONproducts[i].quantity,
                        "singlePrice": (JSONproducts[i].price / JSONproducts[i].quantity).toFixed(2),
                        "totalPrice": JSONproducts[i].price
                    }

                    productsTableMessage += `<tr>`;
                    productsTableMessage += `<td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${valuesDictionary[config.paidMail.firstCol]}</td>`;
                    productsTableMessage += `<td style="padding:10px; text-align: right; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${valuesDictionary[config.paidMail.secondCol]}</td>`;
                    productsTableMessage += `<td style="padding:10px; text-align: right; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${valuesDictionary[config.paidMail.thirdCol]}</td>`;
                    productsTableMessage += `<td style="padding:10px; text-align: right; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${valuesDictionary[config.paidMail.fourthCol]}</td>`;
                    productsTableMessage += `<td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">лв.</td>`;
                    productsTableMessage += `</tr>`;
                    totalPrice += parseFloat(JSONproducts[i].price);
                }

                let mailSubject = config.paidMail.subject;
                mailSubject = mailSubject.replace(/\$user/g, req.session.username);
                mailSubject = mailSubject.replace(/\$orderID/g, orderID);
                mailSubject = mailSubject.replace(/\$time/g, captureDate);

                let mailHeader = (config.paidMail.header).replace(/\n/g, `</p><p style="color:${config.paidMail.color};">`);
                mailHeader = mailHeader.replace(/\$user/g, req.session.username);
                mailHeader = mailHeader.replace(/\$orderID/g, orderID);
                mailHeader = mailHeader.replace(/\$time/g, captureDate);

                let mailFooter = (config.paidMail.footer).replace(/\n/g, `</p><p style="color:${config.paidMail.color};">`);
                mailFooter = mailFooter.replace(/\$user/g, req.session.username);
                mailFooter = mailFooter.replace(/\$orderID/g, orderID);
                mailFooter = mailFooter.replace(/\$time/g, captureDate);

                transporter.sendMail({
                    from: `${config.paidMail.senderName} <${config.paidMail.senderMail}>`, // sender address
                    to: userMail[0].email, // list of receivers
                    subject: mailSubject, // Subject line
                    // text: "There is a new article. It's about sending emails, check it out!", // plain text body
                    html: `<div style="background-color: ${config.paidMail.backgroundColor}; color:${config.paidMail.color}; padding:2.5rem">
                                <div style="color:${config.paidMail.color};"><p>${mailHeader}</p></div><br>
                                <table border="${config.paidMail.tableborder}" style="margin:1rem; border-color:${config.paidMail.borderColor}">
                                    ${productsTableMessage}
                                    <tr>
                                        <td colspan="3" style="text-align: right; padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">Цена на поръчката без ДДС:</td>
                                        <td style="text-align: right; padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${(totalPrice / 1.2).toFixed(2)}</td>
                                        <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">лв.</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="text-align: right; padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">ДДС:</td>
                                        <td style="text-align: right; padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${(totalPrice - totalPrice / 1.2).toFixed(2)}</td>
                                        <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">лв.</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="text-align: right; padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">Цена на поръчката с ДДС:</td>
                                        <td style="text-align: right; padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">${totalPrice.toFixed(2)}</td>
                                        <td style="padding:10px; border-color:${config.paidMail.borderColor}; border-width:${config.paidMail.borderWidth};">лв.</td>
                                    </tr>
                                </table>
                                <div style="color:${config.paidMail.color};">${mailFooter}</div>
                            </div>`
                }).then(info => {
                    console.log({ info });
                }).catch(console.error);

                // console.log(data);
                res.sendStatus(globalConf.http.CUSTOM_OK);
            })
            .catch(err => {
                console.error(err);
                res.status(280).json({
                    message: "Грешка по време на плащането. Моля опитайте отново!"
                });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(280).json({
                message: "Грешка по време на плащането. Моля опитайте отново!"
            });
        });
});


module.exports = router;