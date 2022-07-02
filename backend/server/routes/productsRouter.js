const express = require('express');
const assert = require('assert');
const utils = require('../utils');
const asyncErrorHandler = utils.asyncErrorHandler;
const pool = utils.pool;
const globalConf = require('../config/global.conf.js');

const router = express.Router();
const PAGESIZE = globalConf.pagesize;

router.get("/", (req, res) => {
    res.render("products");
    res.end();
});

// Get all product IDs from shopcart
router.get("/get-all-in-shopcart", asyncErrorHandler(async (req, res) => {
    const userId = req.session.userid;

    const products = await pool.query(
        "SELECT product_id FROM userscartproducts WHERE user_id = $1",
        [userId]
    );

    res.json(products.rows);

}));

// Get all products (for CRUD interface)
router.get("/get-all/:id", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.id;
    let manufacturer = req.query.manufacturer;
    let category = req.query.category;
    let priceFrom = req.query.priceFrom;
    let priceTo = req.query.priceTo;

    let allProducts;

    if (manufacturer && category && priceFrom && priceTo) {
        let manufacturers = manufacturer.split(',');
        let categories = category.split(',');

        allProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image
                WHERE p.manufacturer IN ($1) 
                AND p.category IN ($2) 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) >= $3 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $4 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $5 
                OFFSET $6`,
            [manufacturers, categories, priceFrom, priceTo, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (manufacturer && priceFrom && priceTo) {
        let manufacturers = manufacturer.split(',');
        allProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image
                WHERE p.manufacturer IN ($1) 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) >= $2 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $3 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $4 
                OFFSET $5`,
            [manufacturers, priceFrom, priceTo, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (manufacturer && category) {
        let manufacturers = manufacturer.split(',');
        let categories = category.split(',');

        allProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image
                WHERE p.manufacturer IN ($1) 
                AND p.category IN ($2) 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $3 
                OFFSET $4`,
            [manufacturers, categories, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (category && priceFrom && priceTo) {
        let categories = category.split(',');

        allProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image
                WHERE p.category IN ($1) 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) >= $2 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $3 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $4 
                OFFSET $5`,
            [categories, priceFrom, priceTo, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (manufacturer) {
        let manufacturers = manufacturer.split(',');

        allProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image
                WHERE p.manufacturer IN ($1) 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $2 
                OFFSET $3`,
            [manufacturers, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (category) {
        let categories = category.split(',');

        allProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image
                WHERE p.category IN ($1) 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $2 
                OFFSET $3`,
            [categories, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (priceFrom && priceTo) {
        allProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image
                WHERE CAST ((p.price*1.2) as NUMERIC(10,2)) >= $1 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $2 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $3 
                OFFSET $4`,
            [priceFrom, priceTo, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else {
        allProducts = await pool.query(
            `SELECT p.product_id,
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price,
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name, 
                    p.active
                FROM products p
                INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
                INNER JOIN categories c ON p.category = c.category_id
                INNER JOIN images i ON i.id = p.image 
                WHERE p.active = 't'
                ORDER BY p.product_id 
                LIMIT $1 
                OFFSET $2`,
            [PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }

    res.json(allProducts.rows);
}));

// Get all products
router.get("/getByCategory/:category", asyncErrorHandler(async (req, res) => {
    const categoryReviewSize = 20;

    let category = req.params.category;
    const allProducts = await pool.query(
        `SELECT p.product_id, 
                p.name, 
                CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                p.description, 
                p.summary, 
                i.filename as image, 
                p.quantity, 
                m.name as m_name, 
                c.name as c_name, 
                p.active
            FROM products p
            INNER JOIN manufacturers m ON p.manufacturer = m.manufacturer_id
            INNER JOIN categories c ON p.category = c.category_id
            INNER JOIN images i ON i.id = p.image
            WHERE c.category_id = $1 
            AND p.active = 't'
            ORDER BY p.product_id 
            LIMIT $2`,
        [category, categoryReviewSize]
    );

    res.json(allProducts.rows);
}));

// Get all manufacturers of the given category
router.get("/manufacturers/:categoryID", asyncErrorHandler(async (req, res) => {
    let id = req.params.categoryID;

    const allManufacturers = await pool.query(
        `SELECT DISTINCT m.name, m.manufacturer_id
            FROM manufacturers m
            INNER JOIN products p ON m.manufacturer_id = p.manufacturer
            WHERE p.category = $1`,
        [id]
    );

    res.json(allManufacturers.rows);
}));

// Get all manufacturers of all products
router.get("/manufacturers", asyncErrorHandler(async (req, res) => {
    let category = req.query.category

    let allManufacturers;

    if (category) {
        let categories = category.split(',');

        allManufacturers = await pool.query(
            `SELECT DISTINCT m.name, m.manufacturer_id
                FROM manufacturers m
                INNER JOIN products p ON m.manufacturer_id = p.manufacturer
                WHERE p.category IN ($1)`,
            [categories]
        );
    }
    else {
        allManufacturers = await pool.query(
            `SELECT DISTINCT m.name, m.manufacturer_id
                FROM manufacturers m
                INNER JOIN products p ON m.manufacturer_id = p.manufacturer`
        );
    }

    res.json(allManufacturers.rows);
}));

// Redirect to category's page
router.get("/fullCategory/:id/page/:pageID", asyncErrorHandler(async (req, res) => {
    let id = req.params.id;
    let pageID = req.params.pageID;
    let manufacturer = req.query.manufacturer;
    let priceFrom = req.query.priceFrom;
    let priceTo = req.query.priceTo;

    let numberOfProducts;

    if (manufacturer && priceFrom && priceTo) {
        let manufacturers = manufacturer.split(',');

        numberOfProducts = await pool.query(
            `SELECT COUNT(*) 
                FROM products 
                WHERE category=$1 
                AND manufacturer = ANY ($2) 
                AND CAST ((price*1.2) as NUMERIC(10,2)) >= $3 
                AND CAST ((price*1.2) as NUMERIC(10,2)) <= $4
                AND active = 't'`,
            [id, manufacturers, priceFrom, priceTo]
        );
    }
    else if (priceFrom && priceTo) {
        numberOfProducts = await pool.query(
            `SELECT COUNT(*) 
                FROM products 
                WHERE category=$1 
                AND CAST ((price*1.2) as NUMERIC(10,2)) >= $2 
                AND CAST ((price*1.2) as NUMERIC(10,2)) <= $3
                AND active = 't'`,
            [id, priceFrom, priceTo]
        );
    }
    else if (manufacturer) {
        let manufacturers = manufacturer.split(',');

        for (let i = 0; i < manufacturers.length; i++) {
            manufacturers[i] = parseInt(manufacturers[i]);
        }

        numberOfProducts = await pool.query(
            `SELECT COUNT(*) 
                FROM products 
                WHERE category=$1 
                AND manufacturer = ANY ($2)
                AND active = 't'`,
            [id, manufacturers]
        );
    }
    else {
        numberOfProducts = await pool.query(
            `SELECT COUNT(*) 
                FROM products 
                WHERE category=$1
                AND active = 't'`,
            [id]
        );
    }

    let pages = Math.ceil(numberOfProducts.rows[0].count / PAGESIZE);

    res.render("productsWithFilters", { id: id, pageID: pageID, totalPages: pages });
}));


// List all products from certain category
router.get("/get-all-from-category/:categoryID/page/:pageID", asyncErrorHandler(async (req, res) => {
    let pageID = req.params.pageID;
    let id = req.params.categoryID;
    let manufacturer = req.query.manufacturer;
    let priceFrom = req.query.priceFrom;
    let priceTo = req.query.priceTo;
    let products;

    if (manufacturer && priceFrom && priceTo) {
        let manufacturers = manufacturer.split(',');

        products = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name
                FROM products p
                INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
                INNER JOIN categories c    ON c.category_id = p.category
                INNER JOIN images i        ON i.id = p.image
                WHERE c.category_id = $1 
                AND p.manufacturer = ANY ($2) 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) >= $3 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $4 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $5 
                OFFSET $6`,
            [id, manufacturers, priceFrom, priceTo, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (priceFrom && priceTo) {
        products = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name
                FROM products p
                INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
                INNER JOIN categories c ON c.category_id = p.category
                INNER JOIN images i ON i.id = p.image
                WHERE c.category_id = $1 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) >= $2 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $3 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $4 
                OFFSET $5`,
            [id, priceFrom, priceTo, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }
    else if (manufacturer) {
        let manufacturers = manufacturer.split(',');

        products = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name
                FROM products p
                INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
                INNER JOIN categories c ON c.category_id = p.category
                INNER JOIN images i ON i.id = p.image
                WHERE c.category_id = $1 
                AND p.manufacturer = ANY ($2) 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $3 
                OFFSET $4`,
            [id, manufacturers, PAGESIZE, (pageID - 1) * PAGESIZE]
        );

    }
    else {
        products = await pool.query(
            `SELECT p.product_id,
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name
                FROM products p
                INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
                INNER JOIN categories c ON c.category_id = p.category
                INNER JOIN images i ON i.id = p.image
                WHERE c.category_id = $1 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $2 
                OFFSET $3`,
            [id, PAGESIZE, (pageID - 1) * PAGESIZE]
        );
    }

    res.json(products.rows);
}));

// Get all categories
router.get("/categories", asyncErrorHandler(async (req, res) => {
    const FIRST_TWO_CATEGORIES = 3;
    const allCategories = await pool.query(
        `SELECT DISTINCT name, category_id
         FROM categories 
         WHERE category_id < $1`,
        [FIRST_TWO_CATEGORIES]
    );

    res.json(allCategories.rows);
}));

// Get all product by filter
router.get("/filtered/:id/:categoryID", asyncErrorHandler(async (req, res) => {
    const id = req.params.id;
    const categoryID = req.params.categoryID;
    const data = req.query.data;
    const manufacturersCount = data.manufacturersCount;

    let manufacturers = [];

    for (let i = 0; i < manufacturersCount; i++) {
        let key = "manufacturer" + i;
        manufacturers.push(data[key]);
    }

    let priceTo = 100000;
    let priceFrom = 0;

    if (data["priceTo"] && !isNaN(data["priceTo"])) {
        priceTo = data["priceTo"];
    }

    if (data["priceFrom"] && !isNaN(data["priceFrom"])) {
        priceFrom = data["priceFrom"];
    }

    let filteredProducts;

    if (manufacturersCount > 0) {
        filteredProducts = await pool.query(
            `SELECT p.product_id, 
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price, 
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name
                FROM products p
                INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
                INNER JOIN categories c ON c.category_id = p.category
                INNER JOIN images i ON i.id = p.image
                WHERE manufacturer IN ($1) 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) >= $2 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $3 
                AND p.category = $4 
                AND p.active = 't'
                ORDER BY p.product_id LIMIT $5 OFFSET $6`,
            [manufacturers, priceFrom, priceTo, categoryID, PAGESIZE, (id - 1) * PAGESIZE]
        );
    }
    else {
        filteredProducts = await pool.query(
            `SELECT p.product_id,
                    p.name, 
                    CAST ((p.price*1.2) as NUMERIC(10,2)) as price,
                    p.description, 
                    p.summary, 
                    i.filename as image, 
                    p.quantity, 
                    m.name as m_name, 
                    c.name as c_name
                FROM products p
                INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
                INNER JOIN categories c ON c.category_id = p.category
                INNER JOIN images i ON i.id = p.image
                WHERE CAST ((p.price*1.2) as NUMERIC(10,2)) >= $1 
                AND CAST ((p.price*1.2) as NUMERIC(10,2)) <= $2
                AND p.category = $3 
                AND p.active = 't'
                ORDER BY p.product_id 
                LIMIT $4 
                OFFSET $5`,
            [priceFrom, priceTo, categoryID, PAGESIZE, (id - 1) * PAGESIZE]
        );
    }

    res.json(filteredProducts.rows);
}));

// Add product to user's shopcart
router.post("/add-to-cart", asyncErrorHandler(async (req, res) => {
    const user_id = req.session.userid;
    const product_id = req.body.productid;

    const productQuantity = await pool.query(
        `SELECT quantity 
            FROM products 
            WHERE product_id = $1`,
        [product_id]
    );

    if (productQuantity.rows[0].quantity == 0) {
        res.sendStatus(globalConf.http.CLIENT_ERR);
        return;
    }

    const addedProduct = await pool.query(
        "INSERT into userscartproducts (user_id, product_id) VALUES ($1, $2)",
        [user_id, product_id]
    );

    let response = {};

    if (addedProduct.rowCount == 1) {
        response["success"] = true;
    }
    else {
        response["success"] = false;
    }

    res.json(response);
}));

// Remove product from user's shopcart
router.post("/remove-from-cart", asyncErrorHandler(async (req, res) => {
    const userid = req.session.userid;
    const productid = req.body.productid;

    const deletedProduct = await pool.query(
        `DELETE 
            FROM userscartproducts
            WHERE user_id = $1 
            AND product_id = $2`,
        [userid, productid]
    );

    let response = {};

    if (deletedProduct.rowCount == 1) {
        response["success"] = true;
    }
    else {
        response["success"] = false;
    }

    res.sendStatus(globalConf.http.OK);
}));

module.exports = router;