class ValidationError extends Error {
    constructor(message) {
        super(message)
        this.name = 'ValidationError'
    }
}

const customErrorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        // Handle ValidationError
        return res.status(400).json({ error: err.message }) // Respond with a 400 Bad Request and the error message
    } else {
        next(err) // Pass other errors to the default error handler
    }
}

module.exports = customErrorHandler
exports.ValidationError = ValidationError
