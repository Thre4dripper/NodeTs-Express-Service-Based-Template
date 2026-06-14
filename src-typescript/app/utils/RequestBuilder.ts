import Joi from 'joi';

export enum PayloadType {
    PARAMS,
    QUERY,
    BODY,
    GRPC_PAYLOAD,
}

class RequestBuilder {
    payload: { type: PayloadType; schema: Joi.ObjectSchema }[];

    constructor() {
        this.payload = [];
    }

    addToPath(payload: Joi.ObjectSchema) {
        this.payload.push({ type: PayloadType.PARAMS, schema: payload });
    }

    addToQuery(payload: Joi.ObjectSchema) {
        this.payload.push({ type: PayloadType.QUERY, schema: payload });
    }

    addToBody(payload: Joi.ObjectSchema) {
        this.payload.push({ type: PayloadType.BODY, schema: payload });
    }

    addToGrpcPayload(payload: Joi.ObjectSchema) {
        this.payload.push({ type: PayloadType.GRPC_PAYLOAD, schema: payload });
    }

    getGrpcSchema(): Joi.ObjectSchema | undefined {
        const grpcPayload = this.payload.find((p) => p.type === PayloadType.GRPC_PAYLOAD);
        return grpcPayload?.schema;
    }

    get get() {
        return this.payload;
    }
}

export default RequestBuilder;
