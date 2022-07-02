const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const db = utils.db;
const mode = utils.mode;
const poolAdmin = utils.poolAdmin;
const globalConf = require('../config/global.conf.js');

const router = express.Router();

router.get("/", (req, res) => {
    res.render("createRoles");
});

router.post("/update-role", asyncErrorHandler(async (req, res, next) => {
    let permissions = req.body.permissions;
    let id = req.body.id;
    let name = req.body.name;

    await poolAdmin.query(
        `DELETE FROM rolespermissions WHERE role_id = $1`,
        [id]
    );

    await poolAdmin.query(
        `UPDATE roles
            SET name = $1
            WHERE id = $2`,
        [name, id]
    );

    for (let i = 0; i < permissions.length; i++) {
        await poolAdmin.query(
            `INSERT INTO rolespermissions (role_id, permission_id)
                (
                SELECT $1, id FROM permissions p
                WHERE p.name = $2
                )`,
            [id, permissions[i]]
        );
    }

    const audit_message = "Обновяване на роля!";
    const audit_message_type_id = 2;
    const audit_user_id = req.session.staffid;
    const audit_group = 'staff';

    db.tx({ mode }, async t => {
        await t.any(
            `INSERT 
                INTO auditlog (message, message_type_id, ip, user_id, user_group)
                        VALUES ($1, $2, $3, $4, $5)`,
            [audit_message, audit_message_type_id, req.socket.remoteAddress,
                audit_user_id, audit_group]
        );
    });

    res.sendStatus(globalConf.http.OK);
}));

router.post("/create-permission", asyncErrorHandler(async (req, res, next) => {
    let name = req.body.name;

    const permission = await poolAdmin.query(
        `SELECT * FROM permissions WHERE name=$1`,
        [name]
    );

    if (permission.rows.length > 0) {
        res.json({ success: false });
        return;
    }

    const addPermission = await poolAdmin.query(
        `INSERT INTO permissions (name) VALUES ($1)`,
        [name]
    );

    if (addPermission.rowCount == 1) {
        res.json({ success: true });
    }
    else {
        res.json({ success: false });
    }
}));

router.get("/get-permissions", asyncErrorHandler(async (req, res, next) => {
    const permissions = await poolAdmin.query(
        `SELECT * FROM permissions`
    );

    res.json(permissions.rows);
}));

router.post("/create-role", asyncErrorHandler(async (req, res, next) => {
    let permissions = req.body.permissions;
    let name = req.body.name;

    const newRole = await poolAdmin.query(
        `INSERT INTO roles (name) VALUES ($1)
            RETURNING id`,
        [name]
    );

    for (let i = 0; i < permissions.length; i++) {
        const newPermission = await poolAdmin.query(
            `INSERT INTO rolespermissions (role_id, permission_id) (
                SELECT $1, id FROM permissions p
                WHERE p.name = $2
            )`,
            [newRole.rows[0].id, permissions[i]]
        );

        if (newPermission.rowCount == 0) {
            await poolAdmin.query(
                `DELETE FROM roles WHERE id=$1`,
                [newRole.rows[0].id]
            );

            await poolAdmin.query(
                `DELETE FROM rolespermissions WHERE id=$1`,
                [newRole.rows[0].id]
            );

            res.sendStatus(globalConf.http.SERVER_ERR);
            return;
        }
    }

    const audit_message = "Създаване на роля!";
    const audit_message_type_id = 2;
    const audit_user_id = req.session.staffid;
    const audit_group = 'staff';

    db.tx({ mode }, async t => {
        await t.any(
            `INSERT 
                INTO auditlog (message, message_type_id, ip, user_id, user_group)
                        VALUES ($1, $2, $3, $4, $5)`,
            [audit_message, audit_message_type_id, req.socket.remoteAddress,
                audit_user_id, audit_group]
        );
    });

    res.sendStatus(globalConf.http.OK);
}));

module.exports = router;