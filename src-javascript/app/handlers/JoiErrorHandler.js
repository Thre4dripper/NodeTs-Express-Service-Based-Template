const Joi = require('joi');
const grpc = require('@grpc/grpc-js');
const { createLogger } = require('../utils/Logger');

const log = createLogger('error');

const formatJoi = (err) => err.details.map((e) => e.message).join(', ');

/**
 * A single Joi error handler exposing one entry point per transport: rest, grpc, socket, cron.
 */
class JoiErrorHandler {
    static rest = (err, _req, res, next) => {
        if (err instanceof Joi.ValidationError) {
            return res.status(400).json({ error: formatJoi(err) });
        }
        return next(err);
    };

    static grpc = (err) => {
        if (err instanceof Joi.ValidationError) {
            const message = formatJoi(err);
            return {
                name: 'ValidationError',
                message,
                code: grpc.status.INVALID_ARGUMENT,
                details: message,
                metadata: new grpc.Metadata(),
            };
        }
        return null;
    };

    static socket = (err, socket) => {
        if (err instanceof Joi.ValidationError) {
            socket.emit('error', { message: formatJoi(err) });
            return true;
        }
        return false;
    };

    static cron = (err, jobName = 'cron') => {
        if (err instanceof Joi.ValidationError) {
            log.error({ err: formatJoi(err), job: jobName }, 'Cron validation error');
            return true;
        }
        return false;
    };
}

module.exports = JoiErrorHandler.rest;
module.exports.default = JoiErrorHandler.rest;
module.exports.JoiErrorHandler = JoiErrorHandler;
module.exports.RestJoiErrorHandler = JoiErrorHandler.rest;
module.exports.GrpcJoiErrorHandler = JoiErrorHandler.grpc;
module.exports.SocketJoiErrorHandler = JoiErrorHandler.socket;
module.exports.CronJoiErrorHandler = JoiErrorHandler.cron;
module.exports.joiErrorHandler = JoiErrorHandler.rest;
module.exports.grpcJoiErrorHandler = JoiErrorHandler.grpc;
