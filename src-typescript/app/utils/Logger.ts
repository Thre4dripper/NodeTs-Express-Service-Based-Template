import pino, { Logger } from 'pino';

/**
 * Centralized, monitoring-grade logger.
 *
 * - Structured JSON in production (ready to ship to Datadog, Grafana Loki, Elastic/ELK,
 *   New Relic, Splunk, Sentry, CloudWatch, or any OpenTelemetry collector — most ingest
 *   pino JSON directly, or via a `pino-*` transport selected by `LOG_TRANSPORT`).
 * - Pretty, colorized output in development (`pino-pretty`).
 * - Level controlled by `LOG_LEVEL` (trace|debug|info|warn|error|fatal).
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

const logger: Logger = pino({
    level,
    base: {
        service: process.env.SERVICE_NAME || 'node-service-template',
        env,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Emit `level` as a string label (e.g. "info") so log aggregators index it cleanly.
    formatters: {
        level: (label: string) => ({ level: label }),
    },
    ...(isDev ? { transport: devTransport } : {}),
});

/**
 * Create a child logger tagged with a scope (e.g. 'grpc', 'cron', 'redis', 'socket').
 */
export const createLogger = (scope: string): Logger => logger.child({ scope });

export default logger;
