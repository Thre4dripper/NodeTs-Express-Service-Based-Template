import { RedisOptions } from 'ioredis';

require('dotenv').config();

/**
 * Parse REDIS_ADDRESS ("host:port" or "host") into host + port.
 * Defaults to localhost:6379 so the template boots without extra config.
 */
const parseRedisAddress = (): { host: string; port: number } => {
    const address = process.env.REDIS_ADDRESS || 'localhost:6379';
    const [host, portStr] = address.split(':');
    const port = portStr ? parseInt(portStr, 10) : 6379;

    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid Redis port in REDIS_ADDRESS: ${portStr}`);
    }

    return { host: host || 'localhost', port };
};

/**
 * Shared defaults applied to every Redis client unless overridden.
 */
const buildBaseOptions = (): RedisOptions => {
    const { host, port } = parseRedisAddress();
    const password = process.env.REDIS_PASSWORD || undefined;
    const useTls = (process.env.REDIS_TLS || 'false').toLowerCase() === 'true';

    return {
        host,
        port,
        ...(password && { password }),
        ...(useTls && { tls: {} }),
        retryStrategy(times: number) {
            return Math.min(times * 50, 30_000);
        },
        maxRetriesPerRequest: 3,
        connectTimeout: 10_000,
        commandTimeout: 5_000,
        enableReadyCheck: true,
        // Connect explicitly via redisConnect() in server bootstrap.
        lazyConnect: true,
    };
};

/**
 * Named Redis client definitions. Add a new entry for each logically separate client.
 */
export const redisClientConfigs: Record<string, RedisOptions> = {
    /** Primary cache — general caching, token blacklist, OTP, etc. */
    cache: {
        ...buildBaseOptions(),
        db: 0,
        commandTimeout: 3_000,
        connectionName: 'service:cache',
    },

    /** Session store */
    session: {
        ...buildBaseOptions(),
        db: 1,
        commandTimeout: 5_000,
        connectionName: 'service:session',
    },
};
