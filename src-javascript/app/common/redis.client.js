const Redis = require('ioredis');
const { redisClientConfigs } = require('../../config/redisConfig');
const { createLogger } = require('../utils/Logger');

const log = createLogger('redis');

const cacheClient = new Redis(redisClientConfigs.cache);
const sessionClient = new Redis(redisClientConfigs.session);

const allClients = {
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

const redisConnect = async () => {
    for (const [name, client] of Object.entries(allClients)) {
        await client.connect();
        log.info(`client '${name}' connected`);
    }
};

const redisDisconnect = async () => {
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

module.exports = allClients;
module.exports.default = allClients;
module.exports.cacheClient = cacheClient;
module.exports.sessionClient = sessionClient;
module.exports.redisConnect = redisConnect;
module.exports.redisDisconnect = redisDisconnect;
