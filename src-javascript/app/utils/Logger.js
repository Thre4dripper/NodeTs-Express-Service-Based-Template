const pino = require('pino');

/**
 * Centralized, monitoring-grade logger (JS mirror of Logger.ts).
 *
 * - Structured JSON in production (Datadog / Loki / Elastic / New Relic / Splunk /
 *   Sentry / CloudWatch / OpenTelemetry all ingest pino JSON, directly or via a
 *   `pino-*` transport selected by `LOG_TRANSPORT`).
 * - Pretty output in development (`pino-pretty`).
 * - Level controlled by `LOG_LEVEL`.
 */
const env = (process.env.NODE_ENV || 'development').toLowerCase();
const isDev = env === 'development' || env === 'dev' || env === 'local';
const level = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

const devTransport = {
    target: 'pino-pretty',
    options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
    },
};

const logger = pino({
    level,
    base: {
        service: process.env.SERVICE_NAME || 'node-service-template',
        env,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => ({ level: label }),
    },
    ...(isDev ? { transport: devTransport } : {}),
});

const createLogger = (scope) => logger.child({ scope });

module.exports = logger;
module.exports.default = logger;
module.exports.createLogger = createLogger;
