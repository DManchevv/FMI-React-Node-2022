const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const db = utils.db;
const poolAdmin = utils.poolAdmin;
const getSymbolFromCurrency = require('currency-symbol-map');
const fs = require('fs');
const PDFDocument = require('pdfkit-table');
const dictionary = require('../dictionary');
const router = express.Router();
const excel = require('exceljs');
const globalConf = require('../config/global.conf.js');
const PAGESIZE = globalConf.pagesize;

router.get("/", (req, res) => {
    res.render('reports_orders', {
        message: null
    });
});

router.post("/get-orders", asyncErrorHandler(async (req, res, next) => {
    try {
        const maxDate = await poolAdmin.query(
            `SELECT MAX(date)
             FROM orders`
        );

        const minDate = await poolAdmin.query(
            `SELECT MIN(date)
             FROM orders`
        );

        let maxDateHelper = (req.body.dateTo == -1) ? "(SELECT MAX(date) FROM orders)" : "";
        let minDateHelper = (req.body.dateFrom == -1) ? "(SELECT MIN(date) FROM orders)" : "";

        let dateFrom = (req.body.dateFrom == -1) ? minDate.rows[0].min : req.body.dateFrom;
        let dateTo = (req.body.dateTo == -1) ? maxDate.rows[0].max : req.body.dateTo;
        let statusVal = (req.body.statusFilter === "all") ? '%' : req.body.statusFilter;
        let typeVal = (req.body.typeFilter === "all") ? '%' : req.body.typeFilter;
        let groupBy = req.body.groupType;
        let pageID = req.body.pageID;
        let exportCSV = req.body.exportCSV;
        let exportXLSX = req.body.exportXLSX;
        let exportPDF = req.body.exportPDF;
        let orders;
        let totalPages;
        let ordersNumber;
        let totalPrice;
        let isGroupedByStatus = false;
        let isGroupedByType = false;
        let isGroupedByDate = false;

        assert(dateFrom != null, "Date From is null in export!");
        assert(dateTo != null, "Date To is null in export!");

        if (groupBy[0] == -1) {
            orders = await poolAdmin.query(
                `SELECT o.id, 
                        o.date, 
                        s.name AS status, 
                        o.type, 
                        u.username as username, 
                        o.price, 
                        o.currency, 
                        o.products,
                        (SELECT SUM(p.value)
                         FROM promotions p
                         FULL OUTER JOIN vouchers v ON v.promotion_id = p.id
                         FULL OUTER JOIN vouchers_orders vo ON vo.voucher_id = v.id
                         FULL OUTER JOIN orders ord ON ord.id = vo.order_id
                         WHERE ord.id = o.id
                        ) as discount
                 FROM orders o
                    INNER JOIN statuses s ON o.status = s.id
                    INNER JOIN users u ON o.user_id = u.user_id
                    
                 WHERE o.date >= $1 OR date >= ${minDateHelper}
                   AND o.date <= $2 OR date <= ${maxDateHelper}
                   AND (s.name = $3 OR s.name LIKE $3) 
                   AND (o.type = $4 OR o.type LIKE $4) 
                 ORDER BY o.date DESC
                 LIMIT $5 
                 OFFSET $6`,
                [dateFrom, dateTo, statusVal, typeVal, PAGESIZE, (pageID - 1) * PAGESIZE]
            );
            ordersNumber = await poolAdmin.query(
                `SELECT COUNT (*) FROM orders o
                INNER JOIN statuses s ON o.status = s.id
                WHERE o.date >= $1 AND o.date <= $2 AND (s.name = $3 OR s.name LIKE $3) AND (o.type = $4 OR o.type LIKE $4)`,
                [dateFrom, dateTo, statusVal, typeVal]
            );
            totalPrice = await poolAdmin.query(
                `SELECT SUM(o.price) FROM orders o
                INNER JOIN statuses s ON o.status = s.id
                WHERE o.date >= $1 AND o.date <= $2 AND (s.name = $3 OR s.name LIKE $3) AND (o.type = $4 OR o.type LIKE $4)`,
                [dateFrom, dateTo, statusVal, typeVal]
            )
            totalPages = Math.ceil(ordersNumber.rows[0].count / 30);
        }
        else {
            let helper = "";
            let group = "";
            let orderBy = "";

            for (let i = 0; i < groupBy.length; i++) {
                if (groupBy[i] == "type") {
                    isGroupedByType = true;
                    helper += "o.type as type,"
                    group += "o.type,"

                    if (orderBy == "COUNT(o.id)" || orderBy == "") {
                        orderBy = "o.type";
                    }
                }
                else if (groupBy[i] == "status") {
                    isGroupedByStatus = true;
                    helper += "s.name as status,"
                    group += "s.name,"

                    if (orderBy == "COUNT(o.id)" || orderBy == "") {
                        orderBy = "s.name";
                    }
                }
                else if (groupBy[i] == "day") {
                    isGroupedByDate = true;
                    helper += "DATE_TRUNC('day', o.date) as date,";
                    group += "DATE_TRUNC('day', o.date),";
                    orderBy = "DATE_TRUNC('day', o.date)";
                }
                else if (groupBy[i] == "month") {
                    isGroupedByDate = true;
                    helper += "DATE_TRUNC('month', o.date) as date,";
                    group += "DATE_TRUNC('month', o.date),";
                    orderBy = "DATE_TRUNC('month', o.date)";
                }
                else if (groupBy[i] == "year") {
                    isGroupedByDate = true;
                    helper += "DATE_TRUNC('year', o.date) as date,";
                    group += "DATE_TRUNC('year', o.date),";
                    orderBy = "DATE_TRUNC('year', o.date)";
                }
                else if (groupBy[i] == "all") {
                    helper += "o." + groupBy[i] + ",";
                    group += groupBy[i] + ",";
                    // TODO
                    if (orderBy == "") {
                        orderBy = "COUNT(o.id)"
                    }
                }
            }
            helper = helper.substring(0, helper.length - 1);
            group = group.substring(0, group.length - 1);

            console.log(dateTo);

            orders = await poolAdmin.query(
                `SELECT COUNT(o.id) as id, ` + helper + `, 
                        COUNT(DISTINCT o.user_id) as username, 
                        SUM(o.price) as price, 
                        SUM(p.value) as discount,
                        o.currency 
                FROM orders o
                    FULL OUTER JOIN statuses s ON o.status = s.id
                    FULL OUTER JOIN vouchers_orders vo ON vo.order_id = o.id
                    FULL OUTER JOIN vouchers v ON vo.voucher_id = v.id
                    FULL OUTER JOIN promotions p ON p.id = v.promotion_id
                WHERE date >= $1 OR date >= ${minDateHelper}
                  AND date <= $2 OR date <= ${maxDateHelper}
                  AND (s.name = $3 OR s.name LIKE $3) 
                  AND (o.type = $4 OR o.type LIKE $4)
                GROUP BY ` + group + `, o.currency 
                ORDER BY ` + orderBy + ` DESC 
                LIMIT $5
                OFFSET $6`,
                [dateFrom, dateTo, statusVal, typeVal, PAGESIZE, (pageID - 1) * PAGESIZE]
            );

            ordersNumber = await poolAdmin.query(
                `SELECT COUNT(o.id) as id, ` + helper + `, 
                        COUNT(DISTINCT o.user_id) as username, 
                        SUM(o.price) as price, 
                        SUM(p.value) as discount,
                        o.currency 
                FROM orders o
                    FULL OUTER JOIN statuses s ON o.status = s.id
                    FULL OUTER JOIN vouchers_orders vo ON vo.order_id = o.id
                    FULL OUTER JOIN vouchers v ON vo.voucher_id = v.id
                    FULL OUTER JOIN promotions p ON p.id = v.promotion_id
                WHERE date >= $1 OR date >= ${minDateHelper}
                  AND date <= $2 OR date <= ${maxDateHelper}
                  AND (s.name = $3 OR s.name LIKE $3) 
                  AND (o.type = $4 OR o.type LIKE $4)
                GROUP BY ` + group + `, o.currency`,
                [dateFrom, dateTo, statusVal, typeVal]
            );
            
            totalPrice = await poolAdmin.query(
                `SELECT SUM(o.price) 
                 FROM orders o
                    INNER JOIN statuses s ON o.status = s.id
                 WHERE date >= $1 OR date >= ${minDateHelper}
                   AND date <= $2 OR date <= ${maxDateHelper}
                   AND (s.name = $3 OR s.name LIKE $3) 
                   AND (o.type = $4 OR o.type LIKE $4)`,
                [dateFrom, dateTo, statusVal, typeVal]
            );
            totalPages = Math.ceil(ordersNumber.rows.length / 30);
        }

        const STATUSDICTIONARY = dictionary.en.status;

        const TYPEDICTIONARY = dictionary.en.type;

        const GROUPBYDICTIONARY = dictionary.en.yesno;

        if (exportCSV == "true") {
            let extendedName = 'csvExport-' + Date.now() + '.csv';
            const audit_message = "Експортиране на репорт в CSV файл!";
            const audit_message_type_id = 2;
            const audit_user_id = req.session.staffid;
            const audit_group = 'staff';
            const audit_longmessage = `Потребител ${req.session.staffname} експортира репорт за поръчки в CSV файл
                                с филтри    ${req.body.dateFrom == -1 ? "" : 'От дата:' + dateFrom}, 
                                            ${req.body.dateTo == -1 ? "" : 'До дата:' + dateTo}, 
                                            ${statusVal == '%' ? "" : 'Статус:' + statusVal}, 
                                            ${typeVal == '%' ? "" : 'Тип:' + typeVal}, 
                                с обща сума ${totalPrice.rows[0].sum}`;
            utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
                req.socket.remoteAddress, audit_user_id, audit_group);

            for (let i = 0; i < orders.rows.length; i++) {
                orders.rows[i].products = JSON.stringify(orders.rows[i].products);
            }

            const jsonData = JSON.stringify(orders.rows);

            res.status(globalConf.http.CUSTOM_OK).json({
                message: `Беше успешно генериран CSV файл с име ${extendedName}!`,
                rows: jsonData
            });

            res.end();
        }
        else if (exportXLSX == "true") {
            let extendedName = 'xlsxExport-' + Date.now() + '.xlsx';

            for (let i = 0; i < orders.rows.length; i++) {
                orders.rows[i].products = JSON.stringify(orders.rows[i].products);
                orders.rows[i].products = null;
                orders.rows[i].date = utils.formatDate(orders.rows[i].date);
            }

            const jsonData = JSON.parse(JSON.stringify(orders.rows));
            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Orders');
            worksheet.columns = [
                { header: 'id', key: 'id' },
                { header: 'date', key: 'date' },
                { header: 'status', key: 'status' },
                { header: 'type', key: 'type' },
                { header: 'username', key: 'username' },
                { header: 'price', key: 'price' },
                { header: 'currency', key: 'currency' }
            ];

            let xlsxDateFrom = (req.body.dateFrom == -1) ? "Не е избрана" : utils.formatDate(req.body.dateFrom);
            let xlsxDateTo = (req.body.dateTo == -1) ? "Не е избрана" : utils.formatDate(req.body.dateTo);
            let xlsxGroupByDate;

            if (groupBy.includes("day")) {
                xlsxGroupByDate = "Ден";
            }
            else if (groupBy.includes("month")) {
                xlsxGroupByDate = "Месец";
            }
            else if (groupBy.includes("year")) {
                xlsxGroupByDate = "Година";
            }
            else {
                xlsxGroupByDate = "Не";
            }

            let xlsxFilters = [
                { id: "Име на филтър", date: "Стойност на филтър" },
                { id: "Дата от", date: xlsxDateFrom },
                { id: "Дата до", date: xlsxDateTo },
                { id: "Филтър по статус", date: STATUSDICTIONARY[req.body.statusFilter] },
                { id: "Филтър по тип", date: TYPEDICTIONARY[req.body.typeFilter] },
                { id: "Групиране по статус", date: GROUPBYDICTIONARY[groupBy.includes('status')] },
                { id: "Групиране по тип", date: GROUPBYDICTIONARY[groupBy.includes('type')] },
                { id: "Групиране по дата", date: xlsxGroupByDate }
            ];

            worksheet.addRows(xlsxFilters);
            worksheet.addRows(jsonData);
            workbook.xlsx.writeFile(extendedName)

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");

            workbook.xlsx.write(res)
                .then(() => {
                    console.log("Xlsx file exported successfully!");
                    //res.status(globalConf.http.customOK).json({
                    //    message: `Беше успешно генериран XLSX файл с име ${extendedName}!`
                    //});
                    res.end();
                    fs.unlinkSync(extendedName);
                })
                .catch(err => {
                    console.error(err.message);
                    //res.status(globalConf.http.customServerErr).json({
                    //    message: `Неуспешно експортиране в XLSX файл! Грешка: ${err.message}`
                    //});

                    res.end();
                    return;
                });
        }
        else if (exportPDF == "true") {
            let extendedName = 'pdfExport-' + Date.now() + '.pdf';
            let doc = new PDFDocument({ margin: 30, size: 'A2', compress: false });
            doc.pipe(fs.createWriteStream(extendedName));
            let productsString;

            for (let i = 0; i < orders.rows.length; i++) {
                orders.rows[i].date = utils.formatDate(orders.rows[i].date);
                orders.rows[i].date = (orders.rows[i].date).split(' ')[0];

                if (groupBy[0] == -1 || isGroupedByDate) {
                    orders.rows[i].date = utils.formatDate(orders.rows[i].date);
                    orders.rows[i].date = (orders.rows[i].date).split(' ')[0];
                }

                if (groupBy[0] == -1) {
                    productsString = "";
                    for (let j = 0; j < orders.rows[i].products.length; j++) {
                        productsString += orders.rows[i].products[j].name + '\n';
                    }
                    orders.rows[i].products = productsString;
                }
            }

            const jsonData = JSON.parse(JSON.stringify(orders.rows));
            let tableRow = [];
            let tableData = [];
            for (let row of jsonData) {
                tableRow = [];
                for (let val in row) {
                    tableRow.push(row[val]);
                }
                tableData.push(tableRow);
            }
            let table;
            let tableFilters;
            let pdfDateFrom = (req.body.dateFrom == -1) ? "Не е избрана" : utils.formatDate(req.body.dateFrom);
            let pdfDateTo = (req.body.dateTo == -1) ? "Не е избрана" : utils.formatDate(req.body.dateTo);
            let pdfGroupByDate;

            if (groupBy.includes("day")) {
                pdfGroupByDate = "Ден";
            }
            else if (groupBy.includes("month")) {
                pdfGroupByDate = "Месец";
            }
            else if (groupBy.includes("year")) {
                pdfGroupByDate = "Година";
            }
            else {
                pdfGroupByDate = "Не";
            }

            tableFilters = {
                title: "Filters",
                headers: [
                    { "label": "Име на филтър", "property": "name", "width": 350 },
                    { "label": "Стойност на филтър", "property": "value", "width": 250 }
                ],
                rows: [
                    ["Дата от", pdfDateFrom],
                    ["Дата до", pdfDateTo],
                    ["Филтър по статус", STATUSDICTIONARY[req.body.statusFilter]],
                    ["Филтър по тип", TYPEDICTIONARY[req.body.typeFilter]],
                    ["Групиране по статус", GROUPBYDICTIONARY[groupBy.includes("status")]],
                    ["Групиране по тип", GROUPBYDICTIONARY[groupBy.includes("type")]],
                    ["Групиране по дата", pdfGroupByDate]
                ]
            };

            if (groupBy[0] == -1) {
                table = {
                    title: "Report",
                    headers: [
                        { "label": "ID", "property": "id", "width": 100, "padding": 10 },
                        { "label": "Date", "property": "date", "width": 150, "padding": 20 },
                        { "label": "Status", "property": "status", "width": 100 },
                        { "label": "Type", "property": "type", "width": 100 },
                        { "label": "User", "property": "username", "width": 100 },
                        { "label": "Price", "property": "price", "width": 100 },
                        { "label": "Currency", "property": "currency", "width": 100 },
                        { "label": "Products", "property": "products", "width": 400 }
                    ],
                    rows: tableData
                };
            }
            else {
                table = {
                    title: "Report",
                    headers: [
                        { "label": "Count", "property": "id", "width": 100, "padding": 10 }
                    ],
                    rows: tableData
                }
                if (isGroupedByDate == true) {
                    table.headers.push({ "label": "Date", "property": "date", "width": 100 });
                }
                if (isGroupedByStatus == true) {
                    table.headers.push({ "label": "Status", "property": "status", "width": 100 });
                }
                if (isGroupedByType == true) {
                    table.headers.push({ "label": "Type", "property": "type", "width": 100 });
                }
                table.headers.push({ "label": "Buyers Count", "property": "username", "width": 100 });
                table.headers.push({ "label": "Total Price", "property": "price", "width": 100 });
                table.headers.push({ "label": "Currency", "property": "currency", "width": 100 });
            }

            await doc.table(tableFilters, {
                width: 3000,
                prepareHeader: () => doc.font("./static/fonts/arial.ttf").fontSize(12),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font("./static/fonts/arial.ttf").fontSize(10);
                    indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
                },
            })
                .catch(err => {
                    console.error(err);
                });

            await doc.table(table, {
                width: 3000,
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font("Helvetica").fontSize(10);
                    indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
                },
            })
                .then(() => {
                    doc.end();
                    res.status(globalConf.http.CUSTOM_OK).json(extendedName);
                })
                .catch(err => {
                    console.log(err);
                    res.status(globalConf.http.CUSTOM_SERVER_ERR);
                    res.end();
                    return;
                });
        }
        else {
            for (let i = 0; i < orders.rows.length; i++) {
                orders.rows[i].currency = getSymbolFromCurrency(orders.rows[i].currency);
            }
            const audit_message = "Генериране на репорт!";
            const audit_message_type_id = 2;
            const audit_user_id = req.session.staffid;
            const audit_group = 'staff';
            const audit_longmessage = `Потребител  ${req.session.staffname} генерира репорт за поръчки
                                 с филтри    ${req.body.dateFrom == -1 ? "" : 'От дата:' + dateFrom}, 
                                             ${req.body.dateTo == -1 ? "" : 'До дата:' + dateTo}, 
                                             ${statusVal == '%' ? "" : 'Статус:' + statusVal}, 
                                             ${typeVal == '%' ? "" : 'Тип:' + typeVal}, 
                                 с обща сума ${totalPrice.rows[0].sum}`
            utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
                req.socket.remoteAddress, audit_user_id, audit_group);
            res.json({
                orders: orders.rows,
                totalPages: totalPages,
                pageID: pageID,
                dateFrom: dateFrom,
                dateTo: dateTo,
                statusFilter: req.body.statusFilter,
                typeFilter: req.body.typeFilter,
                type: groupBy,
                totalPrice: totalPrice.rows[0].sum
            });
            res.end();
        }
    } catch (err) {
        throw Error(err);
    }
}));

router.get("/export-file/:filename", asyncErrorHandler(async (req, res) => {
    let filename = req.params.filename;
    res.download(__dirname + '/' + filename, (err) => {
        res.end();
        fs.unlinkSync(__dirname + '/' + filename);
    });
}));

module.exports = router;