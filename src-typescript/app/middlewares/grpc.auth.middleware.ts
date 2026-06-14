import * as grpc from '@grpc/grpc-js';
import { GrpcMiddleware } from '../utils/GrpcMiddleware';
import EncryptionUtil from '../utils/EncryptionUtil';

/**
 * gRPC auth middleware — ISSUER / VERIFIER style.
 *
 * Verifies the RS256 JWT from call metadata and attaches the payload to `call.user`.
 * Throwing here stops the chain; the controller pipeline converts it to a
 * gRPC ServiceError (UNAUTHENTICATED).
 */
export const authenticateGrpc: GrpcMiddleware = async (callContext) => {
    const authHeader = callContext.metadata.get('authorization')?.[0] as string | undefined;

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
        (callContext.call as any).user = payload;
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
