import * as grpc from '@grpc/grpc-js';
import { GrpcMiddleware } from '../utils/GrpcMiddleware';

/**
 * gRPC token middleware — CONSUMER style.
 *
 * Extracts the bearer token from metadata and attaches it to `call.token` for
 * forwarding to the issuer/authority service. Does not verify locally.
 */
export const tokenGrpcMiddleware: GrpcMiddleware = (callContext) => {
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
    if (authHeader.split(' ').length !== 2) {
        throw {
            name: 'AuthenticationError',
            message: 'Invalid Authorization header format',
            code: grpc.status.UNAUTHENTICATED,
            details: 'Invalid Authorization header format',
            metadata: new grpc.Metadata(),
        };
    }

    (callContext.call as any).token = authHeader.split(' ')[1];
};
