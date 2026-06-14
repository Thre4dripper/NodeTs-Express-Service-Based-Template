import * as grpc from '@grpc/grpc-js';

export interface GrpcClientConfig {
    address: string;
    credentials?: grpc.ChannelCredentials;
    options?: grpc.ClientOptions;
    onError?: (error: grpc.ServiceError) => void | never;
}

/** Method names that return ClientUnaryCall (unary RPCs). */
type UnaryMethodNames<TClient> = {
    [K in keyof TClient]: TClient[K] extends (request: any, ...args: any[]) => grpc.ClientUnaryCall
        ? K
        : never;
}[keyof TClient];

/** Method names that return ClientReadableStream (server streaming RPCs). */
type ServerStreamMethodNames<TClient> = {
    [K in keyof TClient]: TClient[K] extends (
        request: any,
        ...args: any[]
    ) => grpc.ClientReadableStream<any>
        ? K
        : never;
}[keyof TClient];

/** Method names that return ClientWritableStream (client streaming RPCs). */
type ClientStreamMethodNames<TClient> = {
    [K in keyof TClient]: TClient[K] extends (...args: any[]) => grpc.ClientWritableStream<any>
        ? K
        : never;
}[keyof TClient];

/** Method names that return ClientDuplexStream (bidi streaming RPCs). */
type BidiStreamMethodNames<TClient> = {
    [K in keyof TClient]: TClient[K] extends (...args: any[]) => grpc.ClientDuplexStream<any, any>
        ? K
        : never;
}[keyof TClient];

type ExtractUnaryRequest<TClient, TMethod extends keyof TClient> = TClient[TMethod] extends (
    request: infer TRequest,
    ...args: any[]
) => any
    ? TRequest
    : never;

type ExtractUnaryResponse<TClient, TMethod extends keyof TClient> = TClient[TMethod] extends {
    (request: any, callback: (error: any, response: infer R) => void): any;
    (request: any, metadata: any, callback: (error: any, response: any) => void): any;
    (request: any, metadata: any, options: any, callback: (error: any, response: any) => void): any;
}
    ? R
    : TClient[TMethod] extends (
            request: any,
            callback: (error: any, response: infer R) => void
        ) => any
      ? R
      : never;

type ExtractServerStreamRequest<TClient, TMethod extends keyof TClient> = TClient[TMethod] extends (
    request: infer TRequest,
    ...args: any[]
) => any
    ? TRequest
    : never;

type ExtractServerStreamResponse<
    TClient,
    TMethod extends keyof TClient,
> = TClient[TMethod] extends (...args: any[]) => grpc.ClientReadableStream<infer TResponse>
    ? TResponse
    : never;

type ExtractClientStreamRequest<TClient, TMethod extends keyof TClient> = TClient[TMethod] extends (
    ...args: any[]
) => grpc.ClientWritableStream<infer TRequest>
    ? TRequest
    : never;

type ExtractClientStreamResponse<
    TClient,
    TMethod extends keyof TClient,
> = TClient[TMethod] extends {
    (callback: (error: any, response: infer R) => void): any;
    (metadata: any, callback: (error: any, response: any) => void): any;
    (metadata: any, options: any, callback: (error: any, response: any) => void): any;
}
    ? R
    : never;

type ExtractBidiStreamRequest<TClient, TMethod extends keyof TClient> = TClient[TMethod] extends (
    ...args: any[]
) => grpc.ClientDuplexStream<infer TRequest, any>
    ? TRequest
    : never;

type ExtractBidiStreamResponse<TClient, TMethod extends keyof TClient> = TClient[TMethod] extends (
    ...args: any[]
) => grpc.ClientDuplexStream<any, infer TResponse>
    ? TResponse
    : never;

/**
 * Comprehensive, type-safe gRPC client factory for calling OTHER services.
 *
 * Features:
 * - Client caching/reuse keyed by a string (e.g. 'userClient').
 * - Promisified unary calls + first-class streaming (server/client/bidi).
 * - Full TypeScript autocomplete + request/response inference from ts-proto stubs.
 * - Consistent error normalization to grpc.ServiceError, with optional per-client onError.
 */
export class GrpcClientFactory {
    private static clientCache = new Map<
        string,
        { client: grpc.Client; config: GrpcClientConfig }
    >();

    /**
     * Create or retrieve a cached gRPC client instance.
     */
    static getOrCreateClient<TClient extends grpc.Client>(
        cacheKey: string,
        ClientCtor: new (
            address: string,
            credentials: grpc.ChannelCredentials,
            options?: grpc.ClientOptions
        ) => TClient,
        config: GrpcClientConfig
    ): TClient {
        const cached = this.clientCache.get(cacheKey);
        if (cached) return cached.client as TClient;

        const client = new ClientCtor(
            config.address,
            config.credentials ?? grpc.credentials.createInsecure(),
            config.options
        );

        this.clientCache.set(cacheKey, { client, config });
        return client;
    }

    /** Close and remove a cached client. */
    static closeClient(cacheKey: string): void {
        const cached = this.clientCache.get(cacheKey);
        if (cached) {
            cached.client.close();
            this.clientCache.delete(cacheKey);
        }
    }

    /** Close all cached clients (call during shutdown / tests). */
    static closeAllClients(): void {
        this.clientCache.forEach(({ client }) => client.close());
        this.clientCache.clear();
    }

    /** Unary call (single request → single response) returned as a Promise. */
    static unary<TClient extends grpc.Client, TMethod extends UnaryMethodNames<TClient>>(
        client: TClient,
        methodName: TMethod,
        request: ExtractUnaryRequest<TClient, TMethod>,
        metadata?: grpc.Metadata,
        options?: grpc.CallOptions
    ): Promise<ExtractUnaryResponse<TClient, TMethod>> {
        const method = this.getMethod(client, methodName as string);

        return new Promise((resolve, reject) => {
            const cb = (
                error: grpc.ServiceError | null,
                response: ExtractUnaryResponse<TClient, TMethod>
            ) => {
                if (error) {
                    const normalized = this.normalizeError(error);
                    const cached = this.findClientConfig(client);
                    if (cached?.config.onError) {
                        try {
                            cached.config.onError(normalized);
                        } catch (handled) {
                            return reject(handled);
                        }
                    }
                    return reject(normalized);
                }
                resolve(response);
            };

            if (metadata) {
                method(request, metadata, options ?? {}, cb);
            } else {
                method(request, options ?? {}, cb);
            }
        });
    }

    /** Server-streaming call (single request → stream of responses). */
    static serverStream<
        TClient extends grpc.Client,
        TMethod extends ServerStreamMethodNames<TClient>,
    >(
        client: TClient,
        methodName: TMethod,
        request: ExtractServerStreamRequest<TClient, TMethod>,
        metadata?: grpc.Metadata,
        options?: grpc.CallOptions
    ): grpc.ClientReadableStream<ExtractServerStreamResponse<TClient, TMethod>> {
        const method = this.getMethod(client, methodName as string);
        return metadata ? method(request, metadata, options ?? {}) : method(request, options ?? {});
    }

    /** Client-streaming call (stream of requests → single response). */
    static clientStream<
        TClient extends grpc.Client,
        TMethod extends ClientStreamMethodNames<TClient>,
    >(
        client: TClient,
        methodName: TMethod,
        metadata?: grpc.Metadata,
        options?: grpc.CallOptions
    ): {
        stream: grpc.ClientWritableStream<ExtractClientStreamRequest<TClient, TMethod>>;
        response: Promise<ExtractClientStreamResponse<TClient, TMethod>>;
    } {
        const method = this.getMethod(client, methodName as string);

        let resolver: (value: ExtractClientStreamResponse<TClient, TMethod>) => void = () => {};
        let rejecter: (reason?: any) => void = () => {};
        const response = new Promise<ExtractClientStreamResponse<TClient, TMethod>>(
            (resolve, reject) => {
                resolver = resolve;
                rejecter = reject;
            }
        );

        const cb = (
            error: grpc.ServiceError | null,
            res: ExtractClientStreamResponse<TClient, TMethod>
        ) => {
            if (error) return rejecter(this.normalizeError(error));
            resolver(res);
        };

        const stream = metadata ? method(metadata, options ?? {}, cb) : method(options ?? {}, cb);
        return { stream, response };
    }

    /** Bidirectional-streaming call (stream ↔ stream). */
    static bidiStream<TClient extends grpc.Client, TMethod extends BidiStreamMethodNames<TClient>>(
        client: TClient,
        methodName: TMethod,
        metadata?: grpc.Metadata,
        options?: grpc.CallOptions
    ): grpc.ClientDuplexStream<
        ExtractBidiStreamRequest<TClient, TMethod>,
        ExtractBidiStreamResponse<TClient, TMethod>
    > {
        const method = this.getMethod(client, methodName as string);
        return metadata ? method(metadata, options ?? {}) : method(options ?? {});
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private static getMethod(client: grpc.Client, methodName: string): any {
        const method = (client as any)[methodName]?.bind(client);
        if (!method) {
            throw this.createError(
                `Method '${methodName}' not found on client`,
                grpc.status.UNIMPLEMENTED
            );
        }
        return method;
    }

    private static findClientConfig(client: grpc.Client) {
        for (const [, cached] of this.clientCache) {
            if (cached.client === client) return cached;
        }
        return null;
    }

    private static createError(message: string, code: grpc.status): grpc.ServiceError {
        return {
            name: 'GrpcClientError',
            message,
            code,
            details: message,
            metadata: new grpc.Metadata(),
        };
    }

    private static normalizeError(error: any): grpc.ServiceError {
        if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
            return error as grpc.ServiceError;
        }
        return {
            name: error?.name || 'GrpcClientError',
            message: error?.message || 'gRPC client call failed',
            code:
                typeof error?.code === 'number' ? (error.code as grpc.status) : grpc.status.UNKNOWN,
            details: error?.details || error?.message || String(error),
            metadata: error?.metadata ?? new grpc.Metadata(),
        };
    }
}
