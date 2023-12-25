import Joi from 'joi'

export enum payloadType {
    PARAMS,
    QUERY,
    BODY
}

class RequestBuilder {
    payload: { type: payloadType, schema: Joi.ObjectSchema }[]

    constructor() {
        this.payload = []
    }

    addToParams(payload: Joi.ObjectSchema) {
        this.payload.push({ type: payloadType.PARAMS, schema: payload })
    }

    addToQuery(payload: Joi.ObjectSchema) {
        this.payload.push({ type: payloadType.QUERY, schema: payload })
    }

    addToBody(payload: Joi.ObjectSchema) {
        this.payload.push({ type: payloadType.BODY, schema: payload })
    }

    get get() {
        return this.payload
    }
}

export default RequestBuilder