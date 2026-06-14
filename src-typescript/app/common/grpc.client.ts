import * as grpc from '@grpc/grpc-js';
import { GrpcClientFactory } from '../utils/GrpcClientFactory';
import { GrpcCustomErrorHandler } from '../handlers/CustomErrorHandler';

/**
 * Generic service-to-service gRPC client factory.
 *
 * Resolves the remote service address from an environment variable, handles
 * TLS/insecure credential selection automatically, and delegates to the shared
 * `GrpcClientFactory` cache so connections are reused across calls.
 *
 * @param cacheKey      - Stable key for the client cache (e.g. `'userService'`).
 * @param ClientClass   - gRPC client constructor (generated stub or runtime class).
 * @param addressEnvVar - Name of the env var that holds `host:port` of the remote service.
 *
 * @example
 * // In a controller or middleware, after generating proto stubs:
 * //   pnpm proto:build
 *
 * import getRpcClient from '../../common/grpc.client';
 * import { UserRpcClient } from '../../../proto/generated/user/user';
 *
 * // Env: REMOTE_SERVICE_GRPC_ADDRESS=user-service:50051
 * const client = getRpcClient('userService', UserRpcClient, 'REMOTE_SERVICE_GRPC_ADDRESS');
 * const user   = await GrpcClientFactory.unary(client, 'getUserById', { userId: '123' });
 */
const getRpcClient = <T extends grpc.Client>(
    cacheKey: string,
    ClientClass: new (address: string, credentials: grpc.ChannelCredentials, options?: object) => T,
    addressEnvVar: string
): T => {
    const serverAddress = process.env[addressEnvVar];
    if (!serverAddress) {
        throw new Error(`${addressEnvVar} is not defined in environment variables`);
    }

    // Local / Docker-internal hosts → insecure channel; everything else → TLS.
    const localHosts = [
        'localhost',
        '127.0.0.1',
        '::1',
        '[::1]',
        'host.docker.internal',
        '0.0.0.0',
    ];
    const useTLS = localHosts.every((host) => !serverAddress.includes(host));

    const credentials = useTLS ? grpc.credentials.createSsl() : grpc.credentials.createInsecure();

    return GrpcClientFactory.getOrCreateClient<T>(cacheKey, ClientClass, {
        address: serverAddress,
        credentials,
        options: {
            'grpc.keepalive_time_ms': 30_000,
            'grpc.keepalive_timeout_ms': 10_000,
            ...(useTLS && { 'grpc.ssl_target_name_override': serverAddress.split(':')[0] }),
        },
        onError: (error) => {
            throw GrpcCustomErrorHandler(error.details);
        },
    });
};

export default getRpcClient;
