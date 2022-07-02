const BaseError = require('./BaseError.js');
const InvalidCredentialsError = require('./InvalidCredentialsError');
const Forbidden403Error = require('./Forbidden403Error');
const sendErrorResponse = require('../../utils').sendErrorResponse;
const globalConf = require('../../config/global.conf');
const Api404Error = require('./Api404Error.js');

function logError (err) {
    if (err instanceof Error) {
        console.error(err);
    }
}

function logErrorMiddleware (err, req, res, next) {
    logError(err);
    next(err);
}

function returnError (err, req, res, next) {
    console.error(err);

    if (err instanceof InvalidCredentialsError) {
        let page = req._parsedUrl.pathname == '/login' ? "login" : "sys-login";
    }
    else if (err instanceof Forbidden403Error) {
        res.sendStatus(403);
    }
    else if (err instanceof Api404Error) {
        res.status(globalConf.http.NOT_FOUND).render('pageNotFound');
    }
    else {
        sendErrorResponse(req, res, globalConf.http.CUSTOM_SERVER_ERR, 
                          "Възникна неочаквана грешка!", err, globalConf.errorCodes.unexpectedError);
    }
}

function isOperationalError(err) {
    if (err instanceof BaseError) {
        return err.isOperational;
    }

    return false
}

module.exports = {
    logError,
    logErrorMiddleware,
    returnError,
    isOperationalError
}
