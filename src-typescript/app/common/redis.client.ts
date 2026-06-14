import Redis from 'ioredis';
import { redisClientConfigs } from '../../config/redisConfig';
import { createLogger } from '../utils/Logger';

const log = createLogger('redis');

// Clients are created eagerly but connect lazily (see redisConnect()).
const cacheClient = new Redis(redisClientConfigs.cache);
const sessionClient = new Redis(redisClientConfigs.session);

/** All clients keyed by name — used for bulk connect / disconnect. */
const allClients: Record<string, Redis> = {
    cache: cacheClient,
    session: sessionClient,
};

for (const [name, client] of Object.entries(allClients)) {
    client.on('connect', () => log.info(`[${name}] connection established`));
    client.on('ready', () => log.info(`[${name}] ready — accepting commands`));
    client.on('error', (err) => log.error({ err: err.message }, `[${name}] error`));
    client.on('close', () => log.warn(`[${name}] connection closed`));
    client.on('reconnecting', () => log.warn(`[${name}] reconnecting...`));
}

/**
 * Connect all Redis clients. Call once during app startup (after DB).
 */
export const redisConnect = async (): Promise<void> => {
    for (const [name, client] of Object.entries(allClients)) {
        await client.connect();
        log.info(`client '${name}' connected`);
    }
};

/**
 * Gracefully disconnect all Redis clients. Call during shutdown.
 */
export const redisDisconnect = async (): Promise<void> => {
    await Promise.allSettled(
        Object.entries(allClients).map(async ([name, client]) => {
            try {
                await client.quit();
                log.info(`client '${name}' disconnected`);
            } catch {
                client.disconnect();
            }
        })
    );
};

export { cacheClient, sessionClient };
export default allClients;
