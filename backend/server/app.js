const stackTrace = require('stack-trace');
const express = require('express');
const app = express();
const https = require('https');
const getSymbolFromCurrency = require('currency-symbol-map')
const flash = require('connect-flash');
const path = require('path');
let session = require('express-session');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const fs = require("fs");
const multer = require("multer");
const readline = require('readline');
const moment = require("moment");
const Forbidden403Error = require('./static/customErrors/Forbidden403Error');
const Api404Error = require('./static/customErrors/Api404Error');
const InvalidCredentialsError = require('./static/customErrors/InvalidCredentialsError');
const globalConf = require('./config/global.conf.js');
const utils = require('./utils');
const loginRouter = require('./routes/loginRouter');
const registerRouter = require('./routes/registerRouter');
const shopcartRouter = require('./routes/shopcartRouter');
const productManagementRouter = require('./routes/productManagementRouter');
const orderManagementRouter = require('./routes/orderManagementRouter');
const usersManagementRouter = require('./routes/usersManagementRouter');
const staffManagementRouter = require('./routes/staffManagementRouter');
const productsRouter = require('./routes/productsRouter');
const reportsOrdersRouter = require('./routes/reportsOrdersRouter');
const configEmailRouter = require('./routes/configEmailRouter');
const promotionsRouter = require('./routes/promotionsRouter');
const myOrdersRouter = require('./routes/myOrdersRouter');
const createRolesRouter = require('./routes/createRolesRouter');
const usersRolesRouter = require('./routes/usersRolesRouter');
const checkoutRouter = require('./routes/checkoutRouter');
const db = utils.db;
const pool = utils.pool;
const poolAdmin = utils.poolAdmin;
const mode = utils.mode;
const asyncErrorHandler = utils.asyncErrorHandler;
const AUDITROWSLIMIT = 1000;

const errorLogger = fs.createWriteStream('errorLog.txt', {
    flags: 'a'
});

const errorLoggerClient = fs.createWriteStream('errorLogClient.txt', {
    flags: 'a'
});

const dispatchTable = require('./config/URLDispatchTable').dispatchTable;

const assert = require('assert');
const PAGESIZE = globalConf.pagesize;
const dictionary = require('./dictionary');

let curUser;
let curStaffUser;
let curHref;

app.use(flash());
app.set('view engine', 'ejs');

//-----------------------------------------------------------------------
/* #region  Setup session */
let PostgreSqlStore = require('connect-pg-simple')(session);

app.use(session({
    store: new PostgreSqlStore(
        {
            conString: "postgres://postgres:310320Mm@localhost:5432/eshop"
        }
    ),
    name: globalConf.session.name,
    secret: globalConf.session.secret,
    saveUninitialized: true,
    cookie: { maxAge: globalConf.session.maxAge },
    resave: false
}));

/* #endregion */

//-----------------------------------------------------------------------
/* #region Requests JSON Format */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/static`))

/* #endregion */

//-----------------------------------------------------------------------
/* #region  Setup Middleware */
app.use(asyncErrorHandler(async (req, res, next) => {
    let role = req.session.staffrole || req.session.role || "guest";
    console.log(role);
    let url;

    if (req.originalUrl.includes("renderPage")) {
        url = req.originalUrl.substr(0, req.originalUrl.lastIndexOf("/"));
    }
    else {
        url = req.originalUrl;
    }

    let dispatchRole = dispatchTable[url];

    if (dispatchRole && !dispatchRole.includes(role)) {
        throw new Forbidden403Error("Access denied!");
    }

    curHref = req.headers.referer;

    if (req.session.username) {
        curUser = req.session.username;
    }

    if (req.session.staffname) {
        curStaffUser = req.session.staffname;
    }

    if (req.session.userid || req.session.staffid) {
        res.locals.session = req.session;
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.moment = moment;
    }

    if (req.session.userid) {
        const numberOfProducts = await db.query(
            `SELECT COUNT(*)
            FROM userscartproducts
            WHERE user_id = $1`,
            [req.session.userid]
        );

        res.locals.shopcartProducts = numberOfProducts[0].count;
    }
    else {
        res.locals.shopcartProducts = 0;
    }

    next();
}));
/* #endregion */

app.get('/api/checkUser', async (req, res) => {
    if (req.session.userid) {
        res.sendStatus(globalConf.http.OK);
    }
    else {
        res.sendStatus(400);
    }
});

app.get('/api/checkBackOfficeUser', async(req, res) => {
    if (req.session.staffid) {
        res.sendStatus(globalConf.http.OK);
    }
    else {
        res.sendStatus(400);
    }
})

// RENDER HOME PAGE
app.get('/', (req, res) => {
    if (req.session != null) {
        if (req.session.role != null) {
            if (req.session.role === "staff") {
                res.redirect('/product-management/renderPage/1');
                return;
            }
        }
    }

    delete req.session.error;
    res.render('index.ejs', { error: "as" });
});

// GET ALL USERS
app.get("/users", async (req, res) => {
    const allUsers = await pool.query("SELECT * FROM users");

    res.json(allUsers.rows);
});

app.use("/login", loginRouter)
   .use("/register", registerRouter)
   .use("/shopcart", shopcartRouter)
   .use("/product-management", productManagementRouter)
   .use("/order-management", orderManagementRouter)
   .use("/products", productsRouter)
   .use("/reports-orders", reportsOrdersRouter)
   .use("/config-email", configEmailRouter)
   .use("/users-management", usersManagementRouter)
   .use("/promotions", promotionsRouter)
   .use("/myOrders", myOrdersRouter)
   .use("/create-roles", createRolesRouter)
   .use("/users-roles", usersRolesRouter)
   .use("/checkout", checkoutRouter)
   .use("/staff-management", staffManagementRouter);

//-----------------------------------------------------------------------

/* #region  Staff Login */

app.get('/back-office', function (req, res) {
    if (req.session.staffid == null) {
        res.render('sys-login', {
            message: null
        });
    }
    else {
        res.redirect('/product-management/renderPage/1');
    }
});

// Find user from login
app.post("/back-office", asyncErrorHandler(async (req, res, next) => {
    const username = req.body.username;
    let password = req.body.password;
    const user = await poolAdmin.query(
        "SELECT id, password, role FROM staff WHERE username = $1",
        [username]
    );

    if (user.rows.length > 0 && password == user.rows[0].password) {
        session = req.session;
        session.staffid = user.rows[0].id;
        session.staffname = username;
        session.staffrole = "staff";

        const audit_message = "Успешно влизане в системата (Back Office) !";
        const audit_message_type_id = 1;
        const audit_user_id = user.rows[0].id;
        const audit_group = 'staff';
        const audit_longmessage = `Потребител ${username} успешно влезе в
                                    Back-Office като ${audit_group}.`

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        req.session.save(function (err) {
            if (err == null) {
                return res.redirect("/product-management/renderPage/1");
            }
            else {
                //   return res.sendStatus(globalConf.http.httpServerErr).json({success: false});
            }
        });
    }
    else {
        const audit_message = "Неуспешно влизане в системата (Back-Offce) !";
        const audit_message_type_id = 1;
        const audit_user_id = 0;
        const audit_group = 'guest';
        const audit_longmessage = `Ново неуспешно влизане в Back-Office
                                    от потребител с IP: ${req.socket.remoteAddress}.`;

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        throw new InvalidCredentialsError("Неправилно потребителско име или парола!")
    }
}));

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Logout */

app.get("/logout", (req, res) => {
    if (req.session.staffid == null) {
        req.sessionStore.destroy(req.session.id, function (error) {
            if (error == null) {
                req.session.destroy(function (error) {
                    if (error === null) {
                        res.sendStatus(globalConf.http.OK);
                    }
                    else {
                        res.sendStatus(500);
                        console.error(error);
                    }
                });
            }
            else {
                res.sendStatus(500);
                console.error(error);
            }
        });
    }
    else {
        session.userid = null;
        session.username = null;
        session.role = null;
        req.session.userid = null;
        req.session.username = null;
        req.session.role = null;
        res.sendStatus(globalConf.http.OK);
    }
});

app.get("/staff-logout", (req, res) => {
    if (req.session.userid == null) {
        req.sessionStore.destroy(req.session.id, function (error) {
            if (error == null) {
                req.session.destroy(function (error) {
                    if (error === null) {
                        res.sendStatus(globalConf.http.OK);
                    }
                    else {
                        res.sendStatus(500);
                        console.error(error);
                    }
                });
            }
            else {
                res.sendStatus(500);
                console.error(error);
            }
        });
    }
    else {
        session.staffid = null;
        session.staffname = null;
        session.staffrole = null;
        req.session.staffid = null;
        req.session.staffname = null;
        req.session.staffrole = null;
        res.sendStatus(globalConf.http.OK);
    }
});

/* #endregion */

//-----------------------------------------------------------------------

/* #region  My Account */

// Render page
app.get("/myAccount", (req, res) => {
    res.render('myAccount');
});

// Get user details
app.get("/myAccount/details", asyncErrorHandler(async (req, res) => {
    const userid = req.session.userid;

    const userAddress = await pool.query(
        "SELECT address, email FROM users WHERE user_id = $1",
        [userid]
    );

    res.json(userAddress.rows);
}));

// Update user account
app.post("/myAccount/address-change", asyncErrorHandler(async (req, res) => {
    if (!req.session.userid) {
        res.redirect("/");
        return;
    }
    else {
        let userid = req.session.userid;
        let userAddress = req.body.address;

        await pool.query(
            "UPDATE users SET address = $1 WHERE user_id = $2",
            [userAddress, userid]
        );
    }
}));

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Shop Cart */
app.post("/vouchers/get-value", async (req, res) => {
  let id = req.body.id;

  let voucherValue = await db.query(
    `SELECT p.value, p.currency
     FROM promotions p
       INNER JOIN vouchers v ON v.promotion_id = p.id
     WHERE v.id = $1`,
     [id]
  );

  assert(voucherValue.length == 1, "Error while accessing voucher's value");

  res.status(globalConf.http.CUSTOM_OK).json(voucherValue[0]);
  res.end();
});

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Price Slider */

// Get Min price
app.get("/price-slider/get-min-price", asyncErrorHandler(async (req, res) => {
    const minPrice = await pool.query(
        `SELECT MIN(price) FROM orders`
    );

    res.json(minPrice.rows[0]);

}));

// Get Max price
app.get("/price-slider/get-max-price", asyncErrorHandler(async (req, res) => {
    const maxPrice = await pool.query(
        `SELECT MAX(price) FROM orders`
    );

    res.json(maxPrice.rows[0]);
}));

/* #endregion */

/* #region  Staff Management */

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Currency Converter */
app.get("/currencyConverter", asyncErrorHandler(async (req, res) => {
    // latest rates
    const request = require('request-promise');

    request('https://freecurrencyapi.net/api/v2/latest?apikey=f94f82d0-5836-11ec-ac0e-bfc9078ccea2&base_currency=BGN')
        .then(response => {
            jsonResponse = JSON.parse(response);
            res.json(jsonResponse.data);
        })
        .catch(error => {
            res.json(error);
            console.log(error);
        });
}));
/* #endregion */

//-----------------------------------------------------------------------

/* #region  Contact Forms */

app.get("/contacts", (req, res) => {
    res.render("contactForm");
});

app.post("/contacts/submit-form", asyncErrorHandler(async (req, res, next) => {
    try {
        let topic = req.body.topic;
        let reason = req.body.reason;
        const orderRegex = /^[0-9]*$/;

        if (orderRegex.test(req.body.order) == false) {
            res.render('contactForm', {
                error: "Номера на поръчката може да съдържа само цифри!"
            });

            return;
        }

        const nameRegex = /^[,.\-a-zA-Zа-яА-Я]*$/

        if (nameRegex.test(req.body.names) == false) {
            res.render('contactForm', {
                error: "Полето 'Име и фамилия' може да съдържа само букви и символите '-' ',' '.'!"
            });

            return;
        }

        const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (emailRegex.test(req.body.email) == false) {
            res.render('contactForm', {
                error: "Невалиден формат на електронната поща!"
            });

            return;
        }

        let orderID = (req.body.order === undefined || req.body.order === '') ? 0 : req.body.order;
        let details = (req.body.details === undefined || req.body.details === '') ? "NO" : req.body.details;
        let names = req.body.names;
        let email = req.body.email;

        let newReport = await pool.query(
            "INSERT INTO contact_forms (topic, reason, order_id, details, names, email) VALUES ($1, $2, $3, $4, $5, $6)",
            [topic, reason, orderID, details, names, email]
        );

        if (newReport.rowCount == 1) {
            res.render('contactForm', {
                message: "Формулярът е изпратен успешно!"
            });

            return;
        }
        else {
            res.render('contactForm', {
                message: "Възникна грешка, моля опитайте отново!"
            });

            return;
        }

    } catch (err) {
        res.render('contactForm', {
            message: "Възникна грешка, моля опитайте отново!"
        });
    }
}));

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Create Roles */
app.get("/roles/get-roles", asyncErrorHandler(async (req, res) => {
    const allRoles = await poolAdmin.query(
        `SELECT * FROM roles r`
    );

    res.json(allRoles.rows);
}));

app.post("/roles/get-role-permissions", asyncErrorHandler(async (req, res, next) => {
    let id = req.body.id;

    const rolePermissions = await poolAdmin.query(
        `SELECT p.name FROM permissions p
            INNER JOIN rolespermissions rp
            ON p.id = rp.permission_id
            WHERE rp.role_id = $1`,
        [id]
    );

    res.json(rolePermissions.rows);
}));

app.post("/roles/delete-role", asyncErrorHandler(async (req, res, next) => {
    let id = req.body.id;

    db.tx({mode}, async t => {
        await t.any(
            `DELETE 
             FROM rolespermissions
             WHERE role_id=$1`,
             [id]
        );

        await poolAdmin.query(
            `DELETE
             FROM roles
             WHERE id=$1`,
             [id]
        );

        return true;
    });

    const audit_message = "Изтриване на роля!";
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

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Users Permissions */

app.get("/users-permissions", asyncErrorHandler(async (req, res) => {
    let users;

    db.tx({ mode }, async t => {
        users = await t.any(
            `SELECT sr.staff_id, s.username, sr.role_id, rp.permission_id, p.name 
            FROM staffroles sr
                INNER JOIN rolespermissions rp ON sr.role_id = rp.role_id
                INNER JOIN permissions p ON p.id = rp.permission_id
                INNER JOIN staff s ON s.id = sr.staff_id
            ORDER BY staff_id, role_id`
        );

        return users;
    })
    .then(data => {
        res.render("userPermissions", {
            data: data
        });
    })
    .catch(err => {
        res.redirect("/");
        console.error(err);
    });
}));

/* #endregion */

//-----------------------------------------------------------------------

/* #region Audit Log */

app.get("/audit-log", asyncErrorHandler(async (req, res) => {
    db.tx({ mode }, async t => {
        const auditlog = await t.any(
            `SELECT a.date, 
                    a.message, 
                    a.ip, 
                    a.user_group, 
                    a.longmessage, 
                    u.username, 
                    m.name as message_type
            FROM auditlog a
              LEFT JOIN users u ON a.user_id = u.user_id
              INNER JOIN auditmessagetypes m ON a.message_type_id = m.id
            ORDER BY a.date DESC
            LIMIT $1`,
            [AUDITROWSLIMIT]
        );

        return auditlog;
    })
    .then(data => {
        res.render('auditlog', {
            data: data
        });
    })
    .catch(err => {
        console.error(err);

        const audit_message = "Съръврна грешка!";
        const audit_message_type_id = 3;
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
        })
        .then(data => {
            res.sendStatus(globalConf.http.CUSTOM_OK);
        })
        .catch(err => {
            console.log(err);

            res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({
                message: "Възникна неочаквана грешка, моля опитайте отново!"
            });
        });
    });
}));

/* #endregion */

//-----------------------------------------------------------------------

/* #region  Error Log File */

app.get("/error-log-file", asyncErrorHandler(async (req, res) => {
    let file = __dirname + '/errorLog.txt';
    var rl = readline.createInterface({
        input: fs.createReadStream(file),
        output: process.stdout,
        terminal: false
    });

    let fileData = "";

    for await (const line of rl) {
        fileData = line.toString() + '\n' + fileData;
    };

    res.render('error-log', {
        textStream: fileData
    });
}));

app.get("/error-log-client-file", asyncErrorHandler(async (req, res) => {
    let file = __dirname + '/errorLogClient.txt';
    var rl = readline.createInterface({
        input: fs.createReadStream(file),
        output: process.stdout,
        terminal: false
    });

    let fileData = "";

    for await (const line of rl) {
        fileData = line.toString() + '\n' + fileData;
    };

    res.render('error-log', {
        textStream: fileData
    });
}));

/* #endregion */

//-----------------------------------------------------------------------

/* #region Mail Template Configuration */



/* #endregion */

//-----------------------------------------------------------------------

/* #region  Import products from XLSX */

/* #endregion */

//-----------------------------------------------------------------------

/* #region Access Dictionary */
app.get("/access-dictionary", (req, res) => {
    res.json(dictionary);
});

/* #endregion */



//-----------------------------------------------------------------------
/* #region Target Groups */

app.get("/target-groups", async(req, res) => {
    let targetGroups = await db.query(
        `SELECT *,
                (SELECT COUNT(*)
                FROM targetgroups tg 
                    INNER JOIN targetgroups_users tgu 
                    ON tg.id = tgu.group_id
                WHERE t.id = tg.id) as recipients
        FROM targetgroups t`
    );

    res.status(200).json(targetGroups);
});

app.post("/target-groups", async(req, res) => {
  let users = req.body.users;
  let name = req.body.name;

  let nameRegex = /^[^\s][a-z0-9A-Z ]{1,98}[^\s]$/;

  if (!nameRegex.test(name)) {
    res.sendStatus(400);
    return;
  }

  await db.tx({mode}, async t => {
    let newTargetGroup = await t.any(
      `INSERT
       INTO targetgroups (name)
                  VALUES ($1)
       RETURNING id`,
       [name]
    );

    assert(newTargetGroup.length == 1, "Target Group Insert was not successful!");

    console.log(newTargetGroup[0].id);

    for (let i = 0; i < users.length; i++) {
      let newUser = await t.any(
       `INSERT
        INTO targetgroups_users (group_id, user_id)
                         VALUES ($1, $2)
        RETURNING user_id`,
        [newTargetGroup[0].id, users[i].user_id]
      );

      assert(newUser.length == 1, "Participant of target group insertion was not successful!");
    }

    return true;
  })
  .then(() => {
    res.sendStatus(201);
  })
  .catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
});

app.post("/target-groups/add-to-target-group", async (req, res) => {
  if (req.body.gender != "male" && req.body.gender != "female" && req.body.gender != "other" && req.body.gender != "all") {
    res.status(globalConf.http.CUSTOM_CLIENT_INPUT_ERR).json("Невалиден пол!");
    return;
  }

  let birthdate = req.body.birthday;
  let daySign;
  let monthSign;
  let day;
  let month;

  if (birthdate != null && birthdate != "") {
    let birthdayRegex = /^[0-9]{2}\/[0-9]{2}$/; //TODO

    if (birthdayRegex.test(birthdate) == false) {
      res.status(globalConf.http.CUSTOM_CLIENT_INPUT_ERR).json("Датата трябва да бъде във формат dd/mm!");
      res.end();
      return;
    }

    birthdate = birthdate.split('/');
    daySign = '=';
    monthSign = '=';
    day = birthdate[0];
    month = birthdate[1];

    if (day < 0 || day > 31) {
      res.status(globalConf.http.CUSTOM_CLIENT_INPUT_ERR).json("Невалиден ден при дата на раждане!");
      res.end();
      return;
    }

    if (month < 0 || month > 12) {
      res.status(globalConf.http.CUSTOM_CLIENT_INPUT_ERR).json("Невалиден месец при дата на раждане!");
      res.end();
      return;
    }

    if ((day > 28 && month == 2) || //TODO
        (day > 30 && (month == 4 || month == 6 || month == 9 || month == 11))) {
          res.status(globalConf.http.CUSTOM_CLIENT_INPUT_ERR).json("Невалидна дата!");
          res.end();
          return;
    }
  }
  else {
    daySign = '::TEXT LIKE';
    monthSign = '::TEXT LIKE';
    day = '%';
    month = '%';
  }

  let userid = req.body.userid || '%';
  let useridSign = req.body.userid == null || req.body.userid == "" ? "::TEXT LIKE" : "="; //TODO
  let firstname = req.body.firstname || '%';
  let firstnameSign = req.body.firstname == null || req.body.firstname == "" ? "LIKE" : '=';
  let lastname = req.body.lastname || '%';
  let lastnameSign = req.body.lastname == null || req.body.lastname == "" ? "LIKE" : '=';
  let gender = req.body.gender == null || req.body.gender == "all" ? '%' : req.body.gender; 
  let genderSign = req.body.gender == null || req.body.gender == "all" ? "::TEXT LIKE" : '=';
  let citizenship = req.body.citizenship == null || req.body.citizenship == "all" ? "%" : req.body.citizenship;
  let citizenshipSign = req.body.citizenship == null || req.body.citizenship == "all" ? "LIKE" : '=';

  const filteredUsers = await db.query(
    `SELECT user_id, 
            firstname, 
            lastname, 
            sex,
            citizenship,
            birthdate 
     FROM users
     WHERE user_id $1:value $2
       AND firstname $3:value $4
       AND lastname $5:value $6
       AND sex $7:value $8
       AND citizenship $9:value $10
       AND EXTRACT(DAY FROM birthdate) $11:value $12
       AND EXTRACT(MONTH FROM birthdate) $13:value $14
     ORDER BY user_id`,
    [useridSign, userid, firstnameSign, firstname, lastnameSign, lastname, genderSign, gender,
     citizenshipSign, citizenship, daySign, day, monthSign, month]
  );

  res.status(globalConf.http.OK).json(filteredUsers);
});

app.get("/web-worker-test", async(req, res) => {
  res.render("web_worker");
});

/* #endregion */

//-----------------------------------------------------------------------

app.post("/front-end-error", asyncErrorHandler(async (req, res) => {
    let timestamp = new Date;
    let year = timestamp.getFullYear();
    let month = timestamp.getMonth() + 1;
    let monthStr = (month >= 10) ? month : `0${month}`;
    let day = timestamp.getDate();
    let dayStr = (day >= 10) ? day : `0${day}`;
    let hours = timestamp.getHours();
    let hoursStr = (hours >= 10) ? hours : `0${hours}`;
    let minutes = timestamp.getMinutes();
    let minutesStr = (minutes >= 10) ? minutes : `0${minutes}`;
    let seconds = timestamp.getSeconds();
    let secondsStr = (seconds >= 10) ? seconds : `0${seconds}`;
    let timestampStr = `${year}-${monthStr}-${dayStr} ${hoursStr}:${minutesStr}:${secondsStr}`;
    curStaffUser = (curStaffUser == null) ? "-" : curStaffUser;
    curUser = (curUser == null) ? "-" : curUser;
    errorLoggerClient.write(`[${timestampStr}] \t [user: ${curUser}] \t [staff user: ${curStaffUser}] [${req.body.url}] \t [${req.body.message}] \t [/${req.body.error}] \t [${req.body.lineNumber}]`);
    errorLoggerClient.write('\n');

    res.sendStatus(globalConf.http.OK);
}));
//-----------------------------------------------------------------------
var options = {
    key: fs.readFileSync('./cert/eshop.key'),
    cert: fs.readFileSync('./cert/eshop.crt')
}

app.use(function (req, res) {
    const whitelistURLs = require('./config/URLDispatchTable').whitelistURLs;

    if (whitelistURLs.includes(req.originalUrl)) {
        res.end();
    }
    else {
        throw new Api404Error("Page Not Found!");
    }
});

const { logError, returnError, isOperationalError } = require('./static/customErrors/errorHandler');
const { name } = require('ejs');
const { resolve } = require('path');
const { months } = require('moment');

app.use(logError);
app.use(returnError);

process.on('unhandledRejection', error => {
    throw error;
});

process.on('uncaughtException', err => {
    processError(err);
});

function processError(err) {
    try {
        console.log(err);
        const DELIMITER_POSITION = 7;
        const SPLIT_DELIMITER = '/';
        const trace = stackTrace.parse(err);
        let shortTrace = trace[0]
            .getFileName()
            .split(SPLIT_DELIMITER)
            .slice(DELIMITER_POSITION)
            .join(SPLIT_DELIMITER);

        let lineNumber = trace[0].getLineNumber();

        if (!isOperationalError(err)) {
            let errMsg = (err.stack).split('\n')[0];
            let timestamp = new Date;
            let year = timestamp.getFullYear();
            let month = timestamp.getMonth() + 1;
            let monthStr = (month >= 10) ? month : `0${month}`;
            let day = timestamp.getDate();
            let dayStr = (day >= 10) ? day : `0${day}`;
            let hours = timestamp.getHours();
            let hoursStr = (hours >= 10) ? hours : `0${hours}`;
            let minutes = timestamp.getMinutes();
            let minutesStr = (minutes >= 10) ? minutes : `0${minutes}`;
            let seconds = timestamp.getSeconds();
            let secondsStr = (seconds >= 10) ? seconds : `0${seconds}`;
            let curHrefMsg = (curHref == undefined) ? "Външен за системата файл." : curHref;
            let timestampStr = `${year}-${monthStr}-${dayStr} ${hoursStr}:${minutesStr}:${secondsStr}`;
            curStaffUser = (curStaffUser == null) ? "-" : curStaffUser;
            curUser = (curUser == null) ? "-" : curUser;
            errorLogger.write(`[${timestampStr}] \t [user: ${curUser}] \t [staff user: ${curStaffUser}] [${curHrefMsg}] \t [${errMsg}] \t [/${shortTrace}] \t [${lineNumber}]`);
            errorLogger.write('\n');
        }
    } catch(err) {
        console.error(err);
        processError(err);
    }
}

const server = https.createServer(options, app);

const port = globalConf.nodeServer.port;

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
