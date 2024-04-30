import { StatusCodes } from '../enums/StatusCodes';

export default class ResponseBuilder {
    response: { status: StatusCodes; message: string; data: any };

    constructor(status: StatusCodes, data: any, message: string) {
        this.response = {
            status,
            data,
            message,
        };
    }
}
