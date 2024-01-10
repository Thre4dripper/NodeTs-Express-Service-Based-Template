const Joi = require('joi')

const joiErrorHandler = (err, req, res, next) => {
    if (err instanceof Joi.ValidationError) {
        // Joi validation error occurred
        const errorMessage = err.details.map((error) => error.message).join(', ')
        res.status(400).json({ error: errorMessage }) // Respond with a 400 Bad Request and the error message
    } else {
        next(err) // Pass other errors to the default error handler
    }
}

module.exports = joiErrorHandler