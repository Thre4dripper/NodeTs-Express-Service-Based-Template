const PayloadType = {
    PARAMS: 0,
    QUERY: 1,
    BODY: 2,
}

class RequestBuilder {
    constructor() {
        this.payload = []
    }

    addToParams(payload) {
        this.payload.push({ type: PayloadType.PARAMS, schema: payload })
    }

    addToQuery(payload) {
        this.payload.push({ type: PayloadType.QUERY, schema: payload })
    }

    addToBody(payload) {
        this.payload.push({ type: PayloadType.BODY, schema: payload })
    }

    get get() {
        return this.payload
    }
}

module.exports.PayloadType = PayloadType
module.exports.default = RequestBuilder