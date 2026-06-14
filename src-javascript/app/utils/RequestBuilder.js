const PayloadType = {
    PARAMS: 0,
    QUERY: 1,
    BODY: 2,
    GRPC_PAYLOAD: 3,
};

class RequestBuilder {
    constructor() {
        this.payload = [];
    }

    /**
     * Validate URL path parameters (e.g. `/user/:id`).
     * Renamed from the legacy `addToParams` for clearer intent.
     */
    addToPath(payload) {
        this.payload.push({ type: PayloadType.PARAMS, schema: payload });
    }

    addToQuery(payload) {
        this.payload.push({ type: PayloadType.QUERY, schema: payload });
    }

    addToBody(payload) {
        this.payload.push({ type: PayloadType.BODY, schema: payload });
    }

    addToGrpcPayload(payload) {
        this.payload.push({ type: PayloadType.GRPC_PAYLOAD, schema: payload });
    }

    getGrpcSchema() {
        const grpcPayload = this.payload.find((p) => p.type === PayloadType.GRPC_PAYLOAD);
        return grpcPayload ? grpcPayload.schema : undefined;
    }

    get get() {
        return this.payload;
    }
}

module.exports.PayloadType = PayloadType;
module.exports.default = RequestBuilder;
