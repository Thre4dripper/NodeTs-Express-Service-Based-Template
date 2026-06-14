require('dotenv').config();

/**
 * Parse REDIS_ADDRESS ("host:port" or "host") into host + port.
 * Defaults to localhost:6379 so the template boots without extra config.
 */
const parseRedisAddress = () => {
    const address = process.env.REDIS_ADDRESS || 'localhost:6379';
    const [host, portStr] = address.split(':');
    const port = portStr ? parseInt(portStr, 10) : 6379;

    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid Redis port in REDIS_ADDRESS: ${portStr}`);
    }

    return { host: host || 'localhost', port };
};

const buildBaseOptions = () => {
    const { host, port } = parseRedisAddress();
    const password = process.env.REDIS_PASSWORD || undefined;
    const useTls = (process.env.REDIS_TLS || 'false').toLowerCase() === 'true';

    return {
        host,
        port,
        ...(password && { password }),
        ...(useTls && { tls: {} }),
        retryStrategy(times) {
            return Math.min(times * 50, 30000);
        },
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        commandTimeout: 5000,
        enableReadyCheck: true,
        lazyConnect: true,
    };
};

const redisClientConfigs = {
    cache: {
        ...buildBaseOptions(),
        db: 0,
        commandTimeout: 3000,
        connectionName: 'service:cache',
    },
    session: {
        ...buildBaseOptions(),
        db: 1,
        commandTimeout: 5000,
        connectionName: 'service:session',
    },
};

module.exports.redisClientConfigs = redisClientConfigs;
