import { StatusCodes } from '../enums/StatusCodes'
import { Response } from 'express'

export default class ResponseBuilder {
    response: { status: StatusCodes; message: string; data: any }

    constructor(res: Response, status: StatusCodes, data: any, message: string) {
        this.response = {
            status,
            data,
            message,
        }

        res.status(status).json(this.response)
    }
}