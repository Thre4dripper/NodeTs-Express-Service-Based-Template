const grpc = require('@grpc/grpc-js');
const EncryptionUtil = require('../utils/EncryptionUtil');

/**
 * gRPC auth middleware — ISSUER / VERIFIER style (JS mirror).
 * Verifies the RS256 JWT from metadata and attaches the payload to call.user.
 */
const authenticateGrpc = async (callContext) => {
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

    const token = authHeader.replace('Bearer ', '');
    try {
        const payload = await EncryptionUtil.verifyToken(token);
        callContext.call.user = payload;
    } catch {
        throw {
            name: 'AuthenticationError',
            message: 'Invalid token',
            code: grpc.status.UNAUTHENTICATED,
            details: 'Invalid token',
            metadata: new grpc.Metadata(),
        };
    }
};

module.exports.authenticateGrpc = authenticateGrpc;
