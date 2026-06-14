/**
 * gRPC middleware contract (JS mirror of GrpcMiddleware.ts).
 *
 * A middleware receives a callContext { request, metadata, call } and either
 * resolves (continue) or throws (stop the chain — the error is converted to a
 * gRPC ServiceError by the controller pipeline).
 */

/**
 * Execute gRPC middlewares in sequence; stops on the first thrown error.
 * @param {Array<Function>} middlewares
 * @param {{request:any, metadata:any, call:any}} callContext
 */
const executeGrpcMiddlewares = async (middlewares, callContext) => {
    for (const middleware of middlewares) {
        await middleware(callContext);
    }
};

module.exports.executeGrpcMiddlewares = executeGrpcMiddlewares;
