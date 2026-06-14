const grpc = require('@grpc/grpc-js');

/**
 * Comprehensive gRPC client factory for calling OTHER services (JS mirror of
 * GrpcClientFactory.ts). Caches clients, promisifies unary calls, and supports
 * server/client/bidi streaming with consistent error normalization.
 */
class GrpcClientFactory {
    static clientCache = new Map();

    static getOrCreateClient(cacheKey, ClientCtor, config) {
        const cached = this.clientCache.get(cacheKey);
        if (cached) return cached.client;

        const client = new ClientCtor(
            config.address,
            config.credentials || grpc.credentials.createInsecure(),
            config.options
        );

        this.clientCache.set(cacheKey, { client, config });
        return client;
    }

    static closeClient(cacheKey) {
        const cached = this.clientCache.get(cacheKey);
        if (cached) {
            cached.client.close();
            this.clientCache.delete(cacheKey);
        }
    }

    static closeAllClients() {
        this.clientCache.forEach(({ client }) => client.close());
        this.clientCache.clear();
    }

    static unary(client, methodName, request, metadata, options) {
        const method = this.getMethod(client, methodName);
        return new Promise((resolve, reject) => {
            const cb = (error, response) => {
                if (error) {
                    const normalized = this.normalizeError(error);
                    const cached = this.findClientConfig(client);
                    if (cached && cached.config.onError) {
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
                method(request, metadata, options || {}, cb);
            } else {
                method(request, options || {}, cb);
            }
        });
    }

    static serverStream(client, methodName, request, metadata, options) {
        const method = this.getMethod(client, methodName);
        return metadata ? method(request, metadata, options || {}) : method(request, options || {});
    }

    static clientStream(client, methodName, metadata, options) {
        const method = this.getMethod(client, methodName);
        let resolver = () => {};
        let rejecter = () => {};
        const response = new Promise((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
        });
        const cb = (error, res) => {
            if (error) return rejecter(this.normalizeError(error));
            resolver(res);
        };
        const stream = metadata ? method(metadata, options || {}, cb) : method(options || {}, cb);
        return { stream, response };
    }

    static bidiStream(client, methodName, metadata, options) {
        const method = this.getMethod(client, methodName);
        return metadata ? method(metadata, options || {}) : method(options || {});
    }

    static getMethod(client, methodName) {
        const method = client[methodName] && client[methodName].bind(client);
        if (!method) {
            throw this.createError(
                `Method '${methodName}' not found on client`,
                grpc.status.UNIMPLEMENTED
            );
        }
        return method;
    }

    static findClientConfig(client) {
        for (const [, cached] of this.clientCache) {
            if (cached.client === client) return cached;
        }
        return null;
    }

    static createError(message, code) {
        return {
            name: 'GrpcClientError',
            message,
            code,
            details: message,
            metadata: new grpc.Metadata(),
        };
    }

    static normalizeError(error) {
        if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
            return error;
        }
        return {
            name: (error && error.name) || 'GrpcClientError',
            message: (error && error.message) || 'gRPC client call failed',
            code: typeof (error && error.code) === 'number' ? error.code : grpc.status.UNKNOWN,
            details: (error && (error.details || error.message)) || String(error),
            metadata: (error && error.metadata) || new grpc.Metadata(),
        };
    }
}

module.exports = GrpcClientFactory;
module.exports.GrpcClientFactory = GrpcClientFactory;
