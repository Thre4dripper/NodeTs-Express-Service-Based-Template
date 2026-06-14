const grpc = require('@grpc/grpc-js');

/**
 * gRPC token middleware — CONSUMER style (JS mirror).
 * Extracts the bearer token to call.token for forwarding; does not verify locally.
 */
const tokenGrpcMiddleware = (callContext) => {
    const md = callContext.metadata.get('authorization');
    const authHeader = md && md[0];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw {
            name: 'AuthenticationError',
            message: 'Missing or invalid Authorization header',
            code: grpc.status.UNAUTHENTICATED,
            details: 'Missing or invalid Authorization header',
            metadata: new grpc.Metadata(),
        };
    }
    if (authHeader.split(' ').length !== 2) {
        throw {
            name: 'AuthenticationError',
            message: 'Invalid Authorization header format',
            code: grpc.status.UNAUTHENTICATED,
            details: 'Invalid Authorization header format',
            metadata: new grpc.Metadata(),
        };
    }

    callContext.call.token = authHeader.split(' ')[1];
};

module.exports.tokenGrpcMiddleware = tokenGrpcMiddleware;
