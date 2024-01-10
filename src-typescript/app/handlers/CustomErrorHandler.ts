import { NextFunction, Request, Response } from 'express'

export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
}

const customErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'ValidationError') {
        // Handle ValidationError
        return res.status(400).json({ error: err.message }) // Respond with a 400 Bad Request and the error message
    } else {
        next(err) // Pass other errors to the default error handler
    }
}

export default customErrorHandler
