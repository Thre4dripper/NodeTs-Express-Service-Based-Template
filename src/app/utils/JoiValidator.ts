import Joi from 'joi'
import { NextFunction } from 'express'

export default class JoiValidator {
    static validate(data: any, schema: Joi.ObjectSchema<any>, next: NextFunction) {
        const { error } = schema.validate(data)

        if (error) {
            next(error)
            return
        }

        next()
    }
}