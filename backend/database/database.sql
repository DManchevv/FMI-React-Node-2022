CREATE DATABASE Eshop;

--\c into Eshop

CREATE TABLE Users(
    user_id SERIAL PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT,
    role TEXT DEFAULT client
);

CREATE TABLE Products(
    product_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    manifacturer integer NOT NULL,
    price numeric(10,5) NOT NULL,
    description TEXT,
    summary TEXT,
    image TEXT,
    quantity integer
);

CREATE TABLE Manufacturers(
    manufacturer_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE Categories(
    category_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE UsersCartProducts(
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE Orders(
    id SERIAL PRIMARY KEY,
    status integer NOT NULL,
    type TEXT NOT NULL,
    user_id TEXT NOT NULL,
    products TEXT[][] NOT NULL,
    price numeric(10,5) NOT NULL
);

CREATE TABLE reports(
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL,
    reason TEXT NOT NULL,
    order_id integer NOT NULL DEFAULT 0,
    details TEXT NOT NULL DEFAULT 'NO',
    names TEXT NOT NULL,
    email TEXT NOT NULL
);

CREATE TABLE images(
    id SERIAL NOT NULL PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    filepath TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size BIGINT NOT NULL,
);

SELECT p.product_id, p.name, p.price, p.description, p.summary, i.filename as image, p.quantity, m.name as m_name, c.name as c_name
                    FROM products p
                    INNER JOIN manufacturers m ON m.manufacturer_id = p.manufacturer
                    INNER JOIN categories c ON c.category_id = p.category
                    INNER JOIN images i ON i.id = p.image
                    WHERE c.category_id = 1 LIMIT 50 OFFSET 90*50;

CREATE TABLE staff(
    id SERIAL PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT,
    role TEXT
);

CREATE TABLE auditlog(
    id SERIAL NOT NULL PRIMARY KEY,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    message TEXT NOT NULL,
    message_type_id INTEGER NOT NULL,
    ip INET NOT NULL,
    user_id INTEGER NOT NULL,
    user_group TEXT NOT NULL,
    longmessage TEXT NOT NULL DEFAULT '-'::TEXT
);

ALTER TABLE users
ADD COLUMN firstname TEXT NOT NULL DEFAULT '1';

ALTER TABLE users
ADD COLUMN lastname TEXT NOT NULL DEFAULT '1';

CREATE TYPE sex as ENUM('male', 'female', 'other');

ALTER TABLE users
ADD COLUMN sex sex NOT NULL default 'other';

ALTER TABLE users
ADD COLUMN birthdate DATE NOT NULL DEFAULT '2000-03-31';

ALTER TABLE users
ADD COLUMN citizenship TEXT NOT NULL DEFAULT 'Bulgaria';

ALTER TABLE users
ADD COLUMN verified BOOLEAN NOT NULL DEFAULT 'n';

CREATE TABLE emailhash(
    id SERIAL NOT NULL primary key,
    expirydate TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    hash TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL
);

CREATE TABLE targetgroups(
    id SERIAL NOT NULL primary key,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE targetgroups_users(
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

CREATE TYPE promotion_status as ENUM('pending', 'active', 'expired');

CREATE TABLE promotions(
    id SERIAL NOT NULL primary key,
    status promotion_status NOT NULL DEFAULT 'pending',
    name TEXT NOT NULL UNIQUE,
    value NUMERIC(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_group_id INTEGER NOT NULL,
    creation_date DATE NOT NULL DEFAULT now(),
    CONSTRAINT fk_target_group
    FOREIGN KEY (target_group_id)
    REFERENCES targetgroups(id)
);

CREATE TABLE vouchers(
    id SERIAL NOT NULL primary key,
    expiration_date DATE NOT NULL,
    promotion_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    CONSTRAINT fk_promotion
    FOREIGN KEY(promotion_id)
    REFERENCES promotions(id),
    CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(user_id)
);

CREATE TABLE vouchers_orders(
    id SERIAL NOT NULL primary key,
    voucher_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    CONSTRAINT fk_voucher
    FOREIGN KEY(voucher_id)
    REFERENCES vouchers(id),
    CONSTRAINT fk_order
    FOREIGN KEY(order_id)
    REFERENCES orders(id)
);

ALTER TABLE promotions
ADD COLUMN currency TEXT NOT NULL DEFAULT 'bgn';

GRANT SELECT, INSERT ON vouchers_orders TO client;

GRANT SELECT, INSERT ON vouchers TO client;

GRANT SELECT, INSERT ON promotions TO client;

GRANT SELECT, INSERT ON vouchers_orders TO staff;

GRANT SELECT, INSERT ON vouchers TO staff;

GRANT SELECT, INSERT ON promotions TO staff;