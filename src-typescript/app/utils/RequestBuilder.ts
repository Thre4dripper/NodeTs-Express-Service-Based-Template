import Joi from 'joi';

export enum PayloadType {
    PARAMS,
    QUERY,
    BODY,
}

class RequestBuilder {
    payload: { type: PayloadType; schema: Joi.ObjectSchema }[];

    constructor() {
        this.payload = [];
    }

    addToParams(payload: Joi.ObjectSchema) {
        this.payload.push({ type: PayloadType.PARAMS, schema: payload });
    }

    addToQuery(payload: Joi.ObjectSchema) {
        this.payload.push({ type: PayloadType.QUERY, schema: payload });
    }

    addToBody(payload: Joi.ObjectSchema) {
        this.payload.push({ type: PayloadType.BODY, schema: payload });
    }

    get get() {
        return this.payload;
    }
}

export default RequestBuilder;
