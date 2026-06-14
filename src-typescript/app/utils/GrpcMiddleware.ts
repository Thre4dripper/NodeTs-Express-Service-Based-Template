import * as grpc from '@grpc/grpc-js';

/**
 * Context passed to every gRPC middleware — mirrors Express's (req, res, next) idea
 * but for gRPC server calls. `call` is the underlying streaming call (any of the 4 kinds).
 */
export interface GrpcCallContext<TRequest = any, TResponse = any> {
    request: TRequest;
    metadata: grpc.Metadata;
    call:
        | grpc.ServerUnaryCall<TRequest, TResponse>
        | grpc.ServerWritableStream<TRequest, TResponse>
        | grpc.ServerReadableStream<TRequest, TResponse>
        | grpc.ServerDuplexStream<TRequest, TResponse>;
}

/**
 * gRPC middleware function. Return/resolve to continue; throw to stop the chain
 * (the thrown error is converted to a gRPC ServiceError by the controller pipeline).
 */
export type GrpcMiddleware<TRequest = any, TResponse = any> = (
    callContext: GrpcCallContext<TRequest, TResponse>
) => Promise<void> | void;

/**
 * Execute gRPC middlewares in sequence; stops on the first thrown error.
 */
export const executeGrpcMiddlewares = async <TRequest = any, TResponse = any>(
    middlewares: GrpcMiddleware<TRequest, TResponse>[],
    callContext: GrpcCallContext<TRequest, TResponse>
): Promise<void> => {
    for (const middleware of middlewares) {
        await middleware(callContext);
    }
};
