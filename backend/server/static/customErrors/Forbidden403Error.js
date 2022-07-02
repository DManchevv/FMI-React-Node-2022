const httpStatusCodes = require('./httpStatusCodes');

const BaseError = require('./BaseError');

class Forbidden403Error extends BaseError {
 constructor (
    name,
    statusCode = httpStatusCodes.FORBIDDEN,
    description = 'Forbidden.',
    isOperational = true
 ) {
    super(name, statusCode, isOperational, description)
 }
}

module.exports = Forbidden403Error;