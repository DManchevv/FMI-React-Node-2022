const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const db = utils.db;
const mode = utils.mode;
const globalConf = require('../config/global.conf.js');

const router = express.Router();

router.get("/", async(req, res) => {
    let success = req.query.success;
    let successMessage = null;
    let errorMessage = null;

    if (success == "yes") {
      successMessage = "Промоцията е успешно създадена!";
    }
    else if (success == "no") {
      errorMessage = "Възникна грешка при създаването на промоцията!";
    }

    let promotions = await db.query(
      `SELECT p.id,
              p.status,
              p.name,
              p.value,
              p.start_date,
              p.end_date,
              p.creation_date,
              p.currency,
              t.name as target_group_name
       FROM promotions p
         INNER JOIN targetgroups t ON p.target_group_id = t.id`
    );

    for (let i = 0; i < promotions.length; i++) {
      promotions[i].start_date = utils.formatDate(promotions[i].start_date);
      promotions[i].end_date = utils.formatDate(promotions[i].end_date);
      promotions[i].creation_date = utils.formatDate(promotions[i].creation_date);
    }

    res.status(200).json(promotions);
});

router.get("/new-promotion", async(req, res) => {
    let targetGroups = await db.query(
        `SELECT *
        FROM targetgroups`
    );

});

router.post("/", async(req, res) => {
    let name = req.body.name;
    let targetGroupID = req.body.targetGroup;
    let value = req.body.value;
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    let voucherExpirationDate = req.body.voucherExpirationDate;

    await db.tx({mode}, async t => {
        let newPromotion = await t.any(
            `INSERT
            INTO promotions (name, value, start_date, end_date, target_group_id)
                    VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [name, value, startDate, endDate, targetGroupID]
        );
        
        assert(newPromotion.length == 1, "Error while inserting new promotion!");

        let users = await t.any(
            `SELECT user_id
            FROM targetgroups_users
            WHERE group_id = $1`,
            [targetGroupID]
        );

        assert(users.length > 0, "Error while getting users from promotion's target group!");

        for (let i = 0; i < users.length; i++) {
            let voucher = await t.any(
            `INSERT
                INTO vouchers (expiration_date, promotion_id, user_id)
                    VALUES ($1, $2, $3)
                RETURNING id`,
                [voucherExpirationDate, newPromotion[0].id, users[i].user_id]
            );

            assert(voucher.length == 1, "Error while inserting new voucher!");
        };

        return true;
    })
    .then(() => {
        res.sendStatus(201);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
});

router.post("/create-promotion/check-name", async(req, res) => {
  let name = req.body.name;

  let promotionName = await db.query(
    `SELECT *
     FROM promotions
     WHERE name = $1`,
     [name]
  );

  console.log(promotionName);

  if (promotionName.length > 0) {
    res.sendStatus(globalConf.http.CUSTOM_CLIENT_INPUT_ERR);
    res.end();
  }
  else {
    res.sendStatus(globalConf.http.CUSTOM_OK);
    res.end();
  }

});

module.exports = router;