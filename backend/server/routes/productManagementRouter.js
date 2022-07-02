const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const db = utils.db;
const mode = utils.mode;
const upload = utils.upload;
const uploadXLSX = utils.uploadXLSX;
const poolAdmin = utils.poolAdmin;
const checksum = utils.checksum;
const unlinkAsync = utils.unlinkAsync;
const fs = require('fs');
const request = require('request-promise');
const router = express.Router();
const excel = require('exceljs');
const globalConf = require('../config/global.conf.js');
const PAGESIZE = globalConf.pagesize;

router.get("/renderPage/:id", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.id;
    let resError = req.query.res;
    let imageName = req.query.image;
    let successMessage;
    let errorMessage;
    let line = req.query.line;

    if (resError == 'noError') {
        let successfulLines = req.query.successfulLines;
        let totalLines = req.query.totalLines;
        successMessage = `Успешно качени продукти - ${successfulLines}/${totalLines}`;
        errorMessage = null;
    }
    else if (resError == 'otherError') {
        errorMessage = "Възникна неочаквана грешка при качване на продуктите! Моля опитайте отново!";
        successMessage = null;
    }
    else if (resError == "imageError") {
        errorMessage = `Открит е файл "${imageName}" на ред ${line} с непозволено файлово разширение! Моля проверете файла и опитайте отново!`;
        successMessage = null;
    }
    else if (resError == "sizeError") {
        errorMessage = `Използвана е снимка "${imageName}" на ред ${line} с прекалено голям файлов размер! Моля променете снимката и опитайте отново!`;
        successMessage = null;
    }
    else if (resError == "downloadError") {
        errorMessage = `Възникна грешка при опит за достъпване на снимка "${imageName}" на ред ${line}. Моля опитайте отново!`;
        successMessage = null;
    }
    else if (resError == "wrongFileError") {
        errorMessage = `Използван е невалиден файл на ред ${line}!`;
        successMessage = null;
    }
    else if (resError == "wrongURIError") {
        errorMessage = `Невалиден URL на снимка "${imageName}" на ред ${line}!`
        successMessage = null;
    }
    else if (resError == "notNumberError") {
        let notNumberErrorMessage = req.query.type == "price" ? 
                                      "Цената може да бъде само положително дробно число!" : 
                                      "Количеството може да бъде само положително цяло число!";
        errorMessage = `${notNumberErrorMessage} - Ред ${line}`;
        successMessage = null;
    }
    else if (resError == "negativeNumberError") {
        let negativeNumberErrorMessage = req.query.type == "price" ?
                                      "Цената не може да бъде отрицателна!" :
                                      "Количеството не може да бъде отрицателно!";
        errorMessage = `${negativeNumberErrorMessage} - Ред ${line}`;
        successMessage = null;
    }
    else {
        errorMessage = null;
    }

    const numberOfProducts = await poolAdmin.query(
        `SELECT COUNT (*)
            FROM products`
    );

    let totalPages = Math.ceil(numberOfProducts.rows[0].count / PAGESIZE);

}));

router.get("/get-all-products/:id", asyncErrorHandler(async (req, res) => {
    let id = req.params.id;
    const allProducts = await poolAdmin.query(
        `SELECT p.product_id, 
                p.name, 
                CAST ((p.price*1.2) as NUMERIC(10,2)) as price,
                p.description, 
                p.summary, 
                p.image, 
                p.quantity, 
                p.active, 
                c.name as c_name, 
                m.name as m_name
            FROM products p
            INNER JOIN categories c ON p.category = c.category_id
            INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
            ORDER BY p.product_id
            LIMIT $1
            OFFSET $2`,
        [PAGESIZE, (id - 1) * PAGESIZE]
    );

    res.status(globalConf.http.CUSTOM_OK).json(allProducts.rows);
}));

router.post("/filter-table-data/:id", asyncErrorHandler(async (req, res) => {
    const columnDictionary = {
        0: "product_id",
        1: "name",
        2: "price",
        3: "quantity",
        4: "manufacturer",
        5: "category",
        6: "active"
    }

    const notLetterOrDigitRegex = /^[,._a-zA-Z0-9]*$/;

    if (notLetterOrDigitRegex.test(req.body.idValue) === false ||
        notLetterOrDigitRegex.test(req.body.nameValue) === false ||
        notLetterOrDigitRegex.test(req.body.priceValue) === false ||
        notLetterOrDigitRegex.test(req.body.quantityValue) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Невалиден символ!" });
        return;
    }

    let counter = req.params.id;
    let sortCol = req.body.sortCol;
    let ascending = (req.body.ascending == true) ? "ASC" : "DESC";
    let idSymbol = (req.body.idValue === '') ? "::TEXT LIKE" : req.body.idSymbol;
    let idValue = (req.body.idValue === '') ? "%" : req.body.idValue
    let nameSymbol = (req.body.nameValue === '') ? "::TEXT LIKE" : req.body.nameSymbol;
    let nameValue = (req.body.nameValue === '') ? "%" : req.body.nameValue;
    let priceSymbol = (req.body.priceValue === "") ? "::TEXT LIKE" : req.body.priceSymbol;
    let priceValue = (req.body.priceValue === "") ? "%" : req.body.priceValue;
    let quantitySymbol = (req.body.quantityValue === "") ? "::TEXT LIKE" : req.body.quantitySymbol;
    let quantityValue = (req.body.quantityValue === "") ? "%" : req.body.quantityValue;
    let manufacturerSymbol = (req.body.manufacturer === "all") ? "::TEXT LIKE" : '=';
    let manufacturer = (req.body.manufacturer === "all") ? "%" : req.body.manufacturer;
    let categorySymbol = (req.body.category === "all") ? "::TEXT LIKE" : '=';
    let category = (req.body.category === "all") ? "%" : req.body.category;
    let activeSymbol = (req.body.active === "all") ? "::TEXT LIKE" : '=';
    let active = (req.body.active === "all") ? "%" : req.body.active;

    if (sortCol < 0 || sortCol > 6) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Невалидна колона за сортиране!" });
        return;
    }

    if (idValue != '%' && Number.isInteger(parseInt(idValue)) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Поредния номер може да бъде само число!" });
        return;
    }

    if (quantityValue != '%' && Number.isInteger(parseInt(quantityValue)) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Количеството може да бъде само число!" });
        return;
    }

    if (priceValue != '%' && Number.isInteger(parseInt(priceValue)) === false) {
        res.status(globalConf.http.CUSTOM_CLIENT_ERR).json({ error: "Общата сума може да бъде само число!" });
        return;
    }

    console.log(ascending);

    const filteredProducts = await db.query(
        `SELECT p.product_id, 
                p.name,
                CAST ((p.price*1.2) as NUMERIC(10,2)) as price,
                p.quantity, 
                c.name as c_name, 
                m.name as m_name, 
                p.description,
                p.summary,
                p.active
            FROM products p
            INNER JOIN categories c ON p.category = c.category_id
            INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
            WHERE p.product_id $1:value $2
            AND p.name $3:value $4
            AND CAST ((p.price*1.2) as NUMERIC(10,2)) $5:value $6
            AND p.quantity $7:value $8
            AND c.category_id $9:value $10
            AND m.manufacturer_id $11:value $12
            AND p.active $13:value $14
            ORDER BY p.$15:name $16:value
            LIMIT $17
            OFFSET $18`,
        [idSymbol, idValue, nameSymbol, nameValue, priceSymbol, priceValue, quantitySymbol, quantityValue,
            categorySymbol, category, manufacturerSymbol, manufacturer, activeSymbol, active,
            columnDictionary[sortCol], ascending, PAGESIZE, counter * PAGESIZE]
    )

    res.status(globalConf.http.CUSTOM_OK).json(filteredProducts);
}));

router.get("/get-all-categories", async (req, res) => {
    const allCategories = await poolAdmin.query(
        `SELECT *
         FROM categories`
    );

    res.status(globalConf.http.CUSTOM_OK).json(allCategories.rows);
});

router.get("/get-all-manufacturers", asyncErrorHandler(async (req, res) => {
    const allManufacturers = await poolAdmin.query(
        `SELECT * 
         FROM manufacturers`
    );

    res.status(globalConf.http.CUSTOM_OK).json(allManufacturers.rows);
}));

// Add product
router.post("/add-product", upload.single('file'), asyncErrorHandler(async (req, res) => {
    try {
        const name = req.body.name;
        const category = req.body.category;
        const manufacturer = req.body.manufacturer;
        const price = req.body.price;
        const description = req.body.description;
        const summary = req.body.summary;
        const quantity = req.body.quantity;
        const DEFAULT_IMAGE = 32;
        let productImage;

        if (req.file) {
            const { filename, mimetype, size } = req.file;
            const filepath = req.file.path;

            let hash;

            const data = await fs.promises.readFile(filepath, 'utf8')
                .catch(err => {
                    console.error(err);
                    res.status(globalConf.http.CUSTOM_OK).json({
                        success: false,
                        message: err
                    });
                });

            hash = checksum(data);

            const findHash = await poolAdmin.query(
                "SELECT id FROM images WHERE checksum=$1",
                [hash]
            );

            if (findHash.rows.length == 0) {
                const newImage = await poolAdmin.query(
                    `INSERT 
                     INTO images (filename, filepath, mimetype, size, checksum)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [filename, filepath, mimetype, size, hash]
                );

                productImage = newImage.rows[0].id;
            }
            else {
                productImage = findHash.rows[0].id;
            }
        }
        else {
            productImage = DEFAULT_IMAGE;
        }

        const manufacturerName = await poolAdmin.query(
            `SELECT manufacturer_id 
             FROM manufacturers WHERE name = $1`,
            [manufacturer]
        );

        assert(productImage !== null, "Undefined image!");

        assert(manufacturerName.rows.length === 1, "Undefined manufacturer while adding product!");

        const categoryName = await poolAdmin.query(
            `SELECT category_id 
             FROM categories WHERE name=$1`,
            [category]
        )

        assert(categoryName.rows.length === 1, "Undefined category while adding product!");

        console.log(productImage);

        const newProduct = await poolAdmin.query(
            `INSERT 
             INTO products 
                    (name, category, manufacturer, price, description, summary, image, quantity) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [name, categoryName.rows[0].category_id, manufacturerName.rows[0].manufacturer_id,
                price, description, summary, productImage, quantity]
        );

        const audit_message = "Добавяне на продукт!";
        const audit_message_type_id = 2;
        const audit_user_id = req.session.staffid;
        const audit_group = 'staff';
        const audit_longmessage = `Потребител ${req.session.staffname} добави нов продукт с име
                                   ${name}, категория ${category}, производител ${manufacturer},
                                   цена ${price}, количество ${quantity},
                                   описание ${description}, кратко описание ${summary}.`

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        res.status(201).redirect('/product-management');

    } catch (err) {
        const audit_message = "Сървърна грешка!";
        const audit_message_type_id = 3;
        const audit_user_id = req.session.staffid;
        const audit_group = 'staff';
        const audit_longmessage = `Сървърна грешка при извършване на операция 'Добавяне на Продукт'
                                   от потребител с ID ${req.session.staffid}. 
                                   Грешка: ${err.message}`

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        throw Error(err);
    }
}));

// Get certain product
router.post("/get-product-details", asyncErrorHandler(async (req, res) => {
    const id = req.body.id;

    if (id) {
        const product = await poolAdmin.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    p.image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                WHERE product_id=$1`,
            [id]
        );

        res.status(globalConf.http.OK).json(product.rows[0]);
    }

}));

// Update a product
router.put("/update-product", asyncErrorHandler(async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const manufacturer = req.body.manufacturer;
        const category = req.body.category;
        const price = req.body.price;
        const description = req.body.description;
        const summary = req.body.summary;
        const quantity = req.body.quantity;

        let updatedProductInfo = "";

        if (id) {
            if (name) {
                await poolAdmin.query(
                    "UPDATE products SET name = $1 WHERE product_id = $2",
                    [name, id]
                );

                updatedProductInfo += ` име: ${name}`;
            }

            if (manufacturer) {
                const manufacturerName = await poolAdmin.query(
                    "SELECT manufacturer_id FROM manufacturers WHERE name=$1",
                    [manufacturer]
                );

                await poolAdmin.query(
                    "UPDATE products SET manufacturer = $1 WHERE product_id = $2",
                    [manufacturerName.rows[0].manufacturer_id, id]
                )

                updatedProductInfo += ` производител: ${manufacturerName}`;
            }

            if (category) {
                const categoryName = await poolAdmin.query(
                    "SELECT category_id FROM categories WHERE name=$1",
                    [category]
                );

                await poolAdmin.query(
                    "UPDATE products SET category = $1 WHERE product_id = $2",
                    [categoryName.rows[0].category_id, id]
                );

                updatedProductInfo += ` категория: ${categoryName}`;
            }

            if (price) {
                await poolAdmin.query(
                    "UPDATE products SET price = $1 WHERE product_id = $2",
                    [price, id]
                );

                updatedProductInfo += ` цена: ${price}`;
            }

            if (description) {
                await poolAdmin.query(
                    "UPDATE products SET description = $1 WHERE product_id = $2",
                    [description, id]
                );

                updatedProductInfo += ` описание: ${description}`;
            }

            if (summary) {
                await poolAdmin.query(
                    "UPDATE products SET summary = $1 WHERE product_id = $2",
                    [summary, id]
                )

                updatedProductInfo += ` кратко описание: ${summary}`
            }

            if (quantity) {
                await poolAdmin.query(
                    `UPDATE products 
                     SET quantity = $1 
                     WHERE product_id = $2`,
                    [quantity, id]
                )
            }
        }

        const audit_message = "Модифициране на продукт!";
        const audit_message_type_id = 2;
        const audit_user_id = req.session.staffid;
        const audit_group = 'staff';
        const audit_longmessage = `Потребител ${req.session.staffname} модифицира
                                   продукт с ID ${id} и характеристики - ${updatedProductInfo}.`

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        res.sendStatus(globalConf.http.OK);

    } catch (err) {
        const audit_message = "Сървърна грешка!";
        const audit_message_type_id = 3;
        const audit_user_id = req.session.staffid;
        const audit_group = 'staff';
        const audit_longmessage = `Сървърна грешка при извършване на операция 'Модифициране на продукт'.
                                   Грешка: ${err.message}`;

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        throw Error(err);
    }
}));

router.get("/edit-product/:id", asyncErrorHandler(async (req, res) => {
    let id = req.params.id;

}));

// Change product's active status
router.post("/change-product-active", asyncErrorHandler(async (req, res) => {
    try {
        let id = req.body.id;
        let active = req.body.active;

        assert(id !== null, "ID cannot be null!");

        let auditActiveText = (active == false) ? "деактивира" : "активира";

        let productUpdate = await poolAdmin.query(
            `UPDATE products 
             SET active = $1 
             WHERE product_id = $2`,
            [active, id]
        );

        const audit_message = "Активиране/Деактивиране на продукт!";
        const audit_message_type_id = 2;
        const audit_user_id = req.session.staffid;
        const audit_group = 'staff';
        const audit_longmessage = `Потребител ${req.session.staffname} ${auditActiveText} 
                                   продукт с ID ${id}.`

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        assert(productUpdate.rowCount == 1, "Error while updating product's status!");

        res.status(globalConf.http.CUSTOM_OK).json(active);
        res.end();

    } catch (err) {
        const audit_message = "Сървърна грешка!";
        const audit_message_type_id = 3;
        const audit_user_id = req.session.staffid;
        const audit_group = 'staff';
        const audit_longmessage = `Сървърна грешка при извършване на операция 'Активиране/Деактивиране на продукт.
                                   Грешка: ${err.message}`;

        utils.insertAudit(audit_message, audit_longmessage, audit_message_type_id,
            req.socket.remoteAddress, audit_user_id, audit_group);

        throw Error(err);
    }
}));

router.get("/add-product-page", async(req, res) => {
    let categories = await db.query(
        `SELECT category_id as id, name
         FROM categories`
    );

    let manufacturers = await db.query(
        `SELECT manufacturer_id as id, name
         FROM manufacturers`
    );

});

router.get("/upload-image-page/:id", asyncErrorHandler(async (req, res) => {
    let id = req.params.id;

    let imagePath;

    db.tx({ mode }, async t => {
        imagePath = await t.any(
            `SELECT filepath 
                FROM images i
                INNER JOIN products p ON p.image = i.id
                WHERE p.product_id = $1`,
            [id]
        );

        return imagePath;
    })
    .then(data => {
        let path = data.length == 0 ? null : data[0].filepath.substring(6, data[0].filepath.length);

    })
    .catch(err => {
        res.send("<script>window.close();</script>");
        console.error(err);
        return;
    });
}));

router.get("/get-all-images", asyncErrorHandler(async (req, res) => {
    let allImages = await poolAdmin.query(
        "SELECT * FROM images"
    );

    res.json(allImages.rows);
}));

router.post("/upload-new-image", upload.single('file'), asyncErrorHandler(async (req, res) => {
    try {
        const id = req.body.id;

        const { filename, mimetype, size } = req.file;
        const filepath = req.file.path;

        let hash;

        fs.readFile(filepath, async function (err, data) {
            hash = checksum(data);

            const findHash = await poolAdmin.query(
                `SELECT id 
                 FROM images 
                 WHERE checksum=$1`,
                [hash]
            );

            let image_id;

            if (findHash.rows.length > 0) {
                await unlinkAsync(req.file.path);
                image_id = findHash.rows[0].id;
            }
            else {
                const newImage = await poolAdmin.query(
                    `INSERT
                     into images (filename, filepath, mimetype, size, checksum) 
                          VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [filename, filepath, mimetype, size, hash]
                );

                image_id = newImage.rows[0].id;
            }

            await poolAdmin.query(
                `UPDATE products 
                 SET image = $1 
                 WHERE product_id = $2`,
                [image_id, id]
            );
        });

        const audit_message = "Добавяне на изображение!";
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

        res.json({ success: true });

    } catch (err) {
        await unlinkAsync(req.file.path);
        throw Error(err);
    }
}));

router.post("/upload-existing-image", asyncErrorHandler(async (req, res) => {
    let checksum = req.body.checksum;
    let id = req.body.id;

    assert(id !== null, "ID is null");

    let updateImage = await poolAdmin.query(
        `SELECT id 
            FROM images 
            WHERE checksum = $1`,
        [checksum]
    );

    let product = await poolAdmin.query(
        `UPDATE products 
            SET image = $1 
            WHERE product_id = $2`,
        [updateImage.rows[0].id, id]
    );

    if (product.rowCount == 1) {
        res.json({ success: true });
    }
    else {
        res.json({ success: false });
    }

    const audit_message = "Промяна на изображение на продукт!";
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
}));

// Get all categories of given manufacturer
router.get("/categories", asyncErrorHandler(async (req, res) => {
    let manufacturer = req.query.manufacturer

    let allCategories;

    if (manufacturer) {
        let manufacturers = manufacturer.split(',');

        allCategories = await poolAdmin.query(
            `SELECT DISTINCT c.name, c.category_id
                FROM categories c
                INNER JOIN products p ON c.category_id = p.category
                WHERE p.manufacturer IN ($1)
                AND p.active = 't'`,
            [manufacturers]
        );
    }
    else {
        allCategories = await poolAdmin.query(
            `SELECT DISTINCT c.name, c.category_id
                FROM categories c
                INNER JOIN products p ON c.category_id = p.category`
        );
    }

    res.json(allCategories.rows);
}));

router.post("/import-products", uploadXLSX.single('file'), asyncErrorHandler(async (req, res) => {
    if (req.file.mimetype != globalConf.supportedImportFiles.xlsx) {
        res.end();
        return;
    }

    let file = req.file.path;
    let workbook = new excel.Workbook();
    await workbook.xlsx.readFile(file)
        .then(async () => {
            const nameColIndex = globalConf.xlsxImport.cols.name;
            const descriptionColIndex = globalConf.xlsxImport.cols.description;
            const quantityColIndex = globalConf.xlsxImport.cols.quantity;
            const priceColIndex = globalConf.xlsxImport.cols.price;
            const categoryAndManufacturerColIndex = globalConf.xlsxImport.cols.categoryAndManufacturer.col;
            const imageColIndex = globalConf.xlsxImport.cols.image;
            let worksheet = workbook.getWorksheet(1);
            let name = {};
            let description = {};
            let price = {};
            let quantity = {};
            let category = {};
            let manufacturer = {};
            let image = {};
            let summary = {};
            let count = 0;

            await new Promise(function (resolve, reject) {
                worksheet.eachRow({ includeEmpty: true }, (row, number) => {
                    if (number != 1) {
                        let cells = row.values;
                        if (cells.length > 0) {
                          name[number] = utils.isJsonObject(cells[nameColIndex]) ? cells[nameColIndex].result : cells[nameColIndex];
                          description[number] = utils.isJsonObject(cells[descriptionColIndex]) ? cells[descriptionColIndex].result : cells[descriptionColIndex];
                          quantity[number] = utils.isJsonObject(cells[quantityColIndex]) ? parseInt(cells[quantityColIndex].result) : parseInt(cells[quantityColIndex]);
                          price[number] = utils.isJsonObject(cells[priceColIndex]) ? cells[priceColIndex].result : cells[priceColIndex];
                          let categoryAndManufacturer = utils.isJsonObject(cells[categoryAndManufacturerColIndex]) ? cells[categoryAndManufacturerColIndex].result : cells[categoryAndManufacturerColIndex];
                          categoryAndManufacturer = categoryAndManufacturer.split(globalConf.xlsxImport.cols.categoryAndManufacturer.delimiter);
                          category[number] = categoryAndManufacturer[globalConf.xlsxImport.cols.categoryAndManufacturer.category];
                          manufacturer[number] = categoryAndManufacturer[globalConf.xlsxImport.cols.categoryAndManufacturer.manufacturer];
                          image[number] = utils.isJsonObject(cells[imageColIndex]) ? cells[imageColIndex].result : cells[imageColIndex];
                          
                          if (image[number] != null) {
                            image[number] = image[number].split(',')[0];
                          }

                          summary[number] = "";
                        }
                    }

                    count = number;
                });

                resolve("Success");
            })
                .catch(err => {
                    console.error(err);
                    throw new Error("Error while reading from file");
                });

            let problemLines = [];

            await db.tx({ mode }, async t => {
                for (let i = 2; i <= count; i++) {
                    if (name[i] == null || description[i] == null || quantity[i] == null || summary[i] == null ||
                        price[i] == null || category[i] == null || manufacturer[i] == null || image[i] == null) {
                        problemLines.push(i);
                        continue;
                    }

                    if (!Number.isFinite(price[i])) {
                        throw new Error(`notNumberError:${i}:price`);
                    }

                    if (!Number.isInteger(quantity[i])) {
                        throw new Error(`notNumberError:${i}:quantity`);
                    }

                    if (price[i] < 0) {
                        throw new Error(`negativeNumberError:${i}:price`);
                    }

                    if (quantity[i] < 0) {
                        throw new Error(`negativeNumberError:${i}:quantity`)
                    }

                    let mimetype;
                    let filename = image[i].split('/').pop();
                    let downloadError;

                    await new Promise(function (resolve, reject) {
                        request.head(image[i], function (err, response, body) {
                            if (response == null) {
                              downloadError = "wrongURIError";
                                return;
                            }

                            mimetype = response.headers['content-type'];
                            assert(mimetype != null, "Mimetype is NULL!");

                            if (mimetype != globalConf.supportedImages.png && mimetype != globalConf.supportedImages.jpg &&
                                mimetype != globalConf.supportedImages.jpeg && mimetype != globalConf.supportedImages.webp) {
                                  downloadError = "mimetypeError";
                                return;
                            }
                        })
                            .catch(err => {
                                if (err.message.includes("Invalid URI")) {
                                    downloadError = "wrongURIError";
                                }
                                else {
                                    downloadError = "imageDownloadError";
                                }

                                Promise.resolve("Done with error");
                            })
                            .finally(() => {
                                resolve("Done");
                            });
                    });

                    if (downloadError == "mimetypeError") {
                        throw new Error(`mimetypeError:${i}:${filename}`);
                    }
                    else if (downloadError == "wrongURIError") {
                        throw new Error(`wrongURIError:${i}:${filename}`);
                    }
                    else if (downloadError == "imageDownloadError") {
                        throw new Error(`imageDownloadError:${i}:${filename}`);
                    }

                    let size = 0;

                    await new Promise(function (resolve, reject) {
                        request(image[i])
                            .on('data', data => {
                                size += data.length;
                                
                                if (size > globalConf.maxFileSize) {
                                  throw new Error('filesizeError');
                                }
                            })
                            .on('error', () => {
                                reject("filesizeError");
                            })
                            .pipe(fs.createWriteStream('static/images/' + filename))
                            .on('close', () => {
                                resolve("Successfully created file");
                            })
                            
                    })
                      .catch(err => {
                        if (err.includes("filesizeError")) {
                          throw new Error(`filesizeError:${i}:${filename}`);
                        }
                        else {
                          throw new Error('unexpectedError');
                        }
                      });

                    const fileStats = fs.statSync('static/images/' + filename);
                    const filesize = fileStats.size;

                    if (filesize > globalConf.maxFileSize) {
                        fs.unlinkSync('static/images/' + filename);
                        throw new Error(`filesizeError:${i}:${filename}`);
                    }

                    const imageData = await fs.promises.readFile('static/images/' + filename, 'utf8')
                        .catch(err => {
                            console.error(err);
                            throw new Error(`imageReadingError:${i}:${filename}`);
                        });

                    let imageHash = checksum(imageData);

                    assert(imageData != null || imageData != '', "Empty image binary data!");

                    let dbImage = await t.any(`SELECT id
                                                FROM images
                                                WHERE checksum = $1`,
                        [imageHash]);

                    assert(dbImage.length < 2, "More than 1 image with the same checksum!");

                    if (dbImage.length > 0) {
                        image[i] = dbImage[0].id;
                    }
                    else {
                        let newImage = await t.any(`INSERT
                                                        INTO images (filename, filepath, mimetype, size, checksum)
                                                            VALUES ($1, $2, $3, $4, $5)
                                                        RETURNING id`,
                            [filename, 'static/images/' + filename, mimetype, filesize, imageHash]
                        );

                        assert(newImage[0].id != null, "Error inserting new image!");

                        image[i] = newImage[0].id;
                    }

                    let dbCategory = await t.any(`SELECT category_id
                                                    FROM categories
                                                    WHERE name = $1`,
                        [category[i].trim()]
                    );

                    assert(dbCategory.length < 2, "More than 1 selected category!");

                    if (dbCategory.length > 0) {
                        category[i] = dbCategory[0].category_id;
                    }
                    else {
                        let newCategory = await t.any(`INSERT
                                                        INTO categories (name)
                                                                    VALUES (TRIM($1))
                                                        RETURNING category_id`,
                            [category[i]]
                        );

                        assert(newCategory[0].category_id != null, "Error inserting new category!");

                        category[i] = newCategory[0].category_id;
                    }

                    let dbManufacturer = await t.any(`SELECT manufacturer_id
                                                        FROM manufacturers
                                                        WHERE name = $1`,
                        [manufacturer[i].trim()]
                    );

                    assert(dbManufacturer.length < 2, "More than 1 selected manufacturer!");

                    if (dbManufacturer.length > 0) {
                        manufacturer[i] = dbManufacturer[0].manufacturer_id;
                    }
                    else {
                        let newManufacturer = await t.any(`INSERT
                                                            INTO manufacturers (name)
                                                                        VALUES (TRIM($1))
                                                            RETURNING manufacturer_id`,
                            [manufacturer[i]]
                        );
                        assert(newManufacturer[0].manufacturer_id != null, "Error inserting new manufacturer!");

                        manufacturer[i] = newManufacturer[0].manufacturer_id;
                    }

                    let newProduct = await t.any(`INSERT 
                                                    INTO products (name, category, manufacturer, price, description, summary, image, quantity)
                                                            VALUES (TRIM($1), $2, $3, $4, TRIM($5), TRIM($6), $7, $8)
                                                    RETURNING product_id`,
                        [name[i], category[i], manufacturer[i], price[i], description[i], summary[i], image[i], quantity[i]]);

                    assert(newProduct.length == 1, "Error inserting new product!");
                }

                return {problemLines: problemLines.length, count: count - 1};
            })
                .then(data => {
                    res.redirect(`/product-management/renderPage/1?res=noError&successfulLines=${data.count - data.problemLines}&totalLines=${data.count}`);
                    res.end();
                })
                .catch(err => {
                    if (err.message.includes("mimetypeError")) {
                        let line = err.message.split(':')[1];
                        let filename = err.message.split(':')[2];
                        res.redirect(`/product-management/renderPage/1?res=imageError&line=${line}&image=${filename}`);
                        res.end();
                    }
                    else if (err.message.includes("filesizeError")) {
                        let line = err.message.split(':')[1];
                        let filename = err.message.split(':')[2];
                        res.redirect(`/product-management/renderPage/1?res=sizeError&line=${line}&image=${filename}`);
                        res.end();
                    }
                    else if (err.message.includes("imageDownloadError")) {
                        let line = err.message.split(':')[1];
                        let filename = err.message.split(':')[2];
                        res.redirect(`/product-management/renderPage/1?res=downloadError&line=${line}&image=${filename}`);
                        res.end();
                    }
                    else if (err.message.includes("wrongURIError")) {
                        let line = err.message.split(':')[1];
                        let filename = err.message.split(':')[2];
                        res.redirect(`/product-management/renderPage/1?res=wrongURIError&line=${line}&image=${filename}`);
                        res.end();
                    }
                    else if (err.message.includes("notNumberError")) {
                        let line = err.message.split(':')[1];
                        let type = err.message.split(':')[2];
                        res.redirect(`/product-management/renderPage/1?res=notNumberError&line=${line}&type=${type}`);
                    }
                    else if (err.message.includes("negativeNumberError")) {
                        let line = err.message.split(':')[1];
                        let type = err.message.split(':')[2];
                        res.redirect(`/product-management/renderPage/1?res=negativeNumberError&line=${line}&type=${type}`);
                    }
                    else {
                        res.redirect(`/product-management/renderPage/1?res=otherError`);
                        res.end();
                    }

                    console.error(err);
                });
        })
        .catch(err => {
            res.redirect('/product-management/renderPage/1?res=otherError');
            res.end();
            console.error(err);
        });
    
    fs.unlinkSync(file);
}));

module.exports = router;