const express = require('express');
const utils = require('../utils');
const db = utils.db;
const poolAdmin = utils.poolAdmin;
const asyncErrorHandler = utils.asyncErrorHandler;
const globalConf = require('../config/global.conf.js');

const router = express.Router();

router.get("/", (req, res) => {
});

router.get("/get-users-roles", asyncErrorHandler(async (req, res, next) => {
    const usersRoles = await poolAdmin.query(
        `SELECT s.username as username, r.name as rolename FROM staffroles sr
        INNER JOIN staff s
        ON s.id = sr.staff_id
        INNER JOIN roles r
        ON r.id = sr.role_id`
    );

    res.json(usersRoles.rows);
}));

router.get("/get-all-roles", asyncErrorHandler(async (req, res, next) => {
    const allRoles = await poolAdmin.query(
        `SELECT name 
            FROM roles
            ORDER BY name`
    );

    res.json(allRoles.rows);
}));

router.get("/get-all-users", asyncErrorHandler(async (req, res, next) => {
    const allUsers = await poolAdmin.query(
        `SELECT username as name 
            FROM staff
            ORDER BY username`
    );

    res.json(allUsers.rows);
}));

router.post("/assign-new-role", asyncErrorHandler(async (req, res, next) => {
    const DEFAULT_ERROR_MESSAGE = "Възникна грешка при възлагането на нова роля. Моля опреснете страницата и опитайте отново!";
    const DUPLICATED_ROLE_ERROR = "Този потребител вече притежава тази роля!";

    let user = req.body.user;
    let role = req.body.role;

    const userID = await poolAdmin.query(
        `SELECT id FROM staff WHERE username = $1`,
        [user]
    );

    const roleID = await poolAdmin.query(
        `SELECT id FROM roles WHERE name = $1`,
        [role]
    );

    const checkForExistingRole = await db.query(
        `SELECT *
            FROM staffroles
            WHERE staff_id = $1 AND role_id = $2`,
        [userID.rows[0].id, roleID.rows[0].id]
    );

    if (checkForExistingRole.length > 0) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: DUPLICATED_ROLE_ERROR });
    }

    const newRelation = await poolAdmin.query(
        `INSERT INTO staffroles (staff_id, role_id) VALUES ($1, $2)`,
        [userID.rows[0].id, roleID.rows[0].id]
    );

    if (newRelation.rowCount === 1) {
        res.status(globalConf.http.CUSTOM_OK).json({ message: "Ролята е успешно създадена!" });
    }
    else {
        res.status(globalConf.http.CUSTOM_SERVER_ERR).json({ error: DEFAULT_ERROR_MESSAGE });
    }
}));

router.post("/delete-relation", asyncErrorHandler(async (req, res, next) => {
    if (req.session.staffid === null) {
        res.redirect("/");
        return;
    }

    let username = req.body.user;
    let rolename = req.body.role;

    const deletedRelation = await poolAdmin.query(
        `DELETE 
            FROM staffroles 
            WHERE staff_id = (
                            SELECT id 
                            FROM staff 
                            WHERE username = $1
                            ) 
            AND role_id = (
                            SELECT id 
                            FROM roles 
                            WHERE name = $2
                            )`,
        [username, rolename]
    );

    if (deletedRelation.rowCount === 1) {
        res.sendStatus(globalConf.http.CUSTOM_OK);
    }
    else {
        res.sendStatus(globalConf.http.CUSTOM_SERVER_ERR);
    }
}));

module.exports = router;