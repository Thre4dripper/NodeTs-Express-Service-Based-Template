const { STATUS_CODES } = require('node:http');
const { StatusCodes } = require('../enums/StatusCodes');

class ValidationError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.name = 'ValidationError';
        this.errorCode = errorCode;
    }
}

const customErrorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        // Handle ValidationError
        return res.status(err.errorCode || StatusCodes.BAD_REQUEST).json({ error: err.message }); // Respond with a 400 Bad Request and the error message
    } else {
        next(err); // Pass other errors to the default error handler
    }
};

module.exports = customErrorHandler;
exports.ValidationError = ValidationError;
