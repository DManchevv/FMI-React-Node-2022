const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
//const pool = require('./db')('client','client');
//const db = require('./_db')('postgres', '310320Mm');
const payPalClient = require('./paypalClient');
const { RefundsGetRequest } = require('@paypal/checkout-server-sdk/lib/payments/lib');
const { resolveInclude } = require('ejs');
const { json } = require('express');

// 2. Set up your server to receive a call from the client
module.exports = async function handleRequest(req, res, db) {

  // 2a. Get the order ID from the request body
  const paypalOrderID = req.body.paypalOrderID;
  const orderID = req.body.orderID;

  // 3. Call PayPal to capture the order
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderID);
  request.requestBody({});

  //console.log(capture);
  //console.log(capture.result.purchase_units[0]);
  //console.log(capture.result.payer.name);
  //console.log(capture.result.payer.address);

  const isOrderPaid = await db.query(
    `SELECT payment_id
      FROM orders
      WHERE id = $1`,
      [orderID]
  );

  if (isOrderPaid[0].payment_id !== null) {
    console.log("FAIL");
    return false;
  }

  const capture = await payPalClient.client().execute(request);

  //const refund = new checkoutNodeJssdk.payments.refund(paypalOrderID);

  //await payPalClient.client().execute(refund);
  // 4. Save the capture ID to your database. Implement logic to save capture to your database for future reference.

  return capture;

  // 6. Return a successful response to the client
}
