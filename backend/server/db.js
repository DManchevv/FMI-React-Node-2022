const Pool = require('pg').Pool;

module.exports = function(username, password) {
    return pool = new Pool({
            user: username,
            password: password,
            database: "eshop",
            host: "localhost",
            port: 5432
           });
}
