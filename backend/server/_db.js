const pgp = require('pg-promise')({
    error(err, e) {
        if (e.query) {
            console.error("E.query");
            
            if (e.params) {
                console.error("E.params");
            }
        }

        if (e.cn) {
            console.error("E.cn");
        }

        if (e.ctx) {
            console.error("E.ctx");
        }
    }
});

module.exports = function(user, password) {
    const connect = 'postgres://'+user+':' + password + '@localhost:5432/eshop';
    const db = pgp(connect);
    return db;
}