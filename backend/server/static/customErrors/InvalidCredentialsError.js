const httpStatusCodes = require('./httpStatusCodes');

const BaseError = require('./BaseError');

class InvalidCredentialsError extends BaseError {
 constructor (
    name,
    statusCode = httpStatusCodes.UNAUTHORIZED,
    description = 'Invalid Credentials.',
    isOperational = true
 ) {
    super(name, statusCode, isOperational, description)
 }
}

module.exports = InvalidCredentialsError;