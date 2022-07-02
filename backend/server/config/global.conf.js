module.exports = globalConf = {
    ip: "127.0.0.1",
    port: 3000,
    nodemailer: {
        host: 'smtp.gmail.com',
        port: 465,
        user: 'mitkoeshop@gmail.com',
        pass: 'redgtpchnjosjekv'
    },
    crypto: {
        iterations: 1000,
        keylength: 64,
        digest: 'sha512',
        bytenumber: 128
    },
    pagesize: 60,
    http: {
        OK: 200,
        CUSTOM_CLIENT_INPUT_ERR: 259,
        CUSTOM_OK: 260,
        CLIENT_ERR: 400,
        NOT_FOUND: 404,
        CUSTOM_CLIENT_ERR: 460,
        SERVER_ERR: 500,
        CUSTOM_SERVER_ERR: 560
    },
    nodeServer: {
        port: 3000
    },
    session: {
        name: "connect.sid",
        secret: "secret",
        maxAge: 1000 * 60 * 60 * 3
    },
    xlsxImport: {
        cols: {
            name: 3,
            description: 4,
            quantity: 7,
            price: 8,
            categoryAndManufacturer: {
                col: 9,
                delimiter: '>',
                manufacturer: 0,
                category: 1
            },
            image: 10
        }
    },
    maxFileSize: 2*1024*1024,
    supportedImages: {
        jpg: "image/jpg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp"
    },
    supportedImportFiles: {
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    errorCodes: {
        unexpectedError: 1000,

    }
}