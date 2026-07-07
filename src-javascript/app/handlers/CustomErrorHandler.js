// start grpc
const grpc = require('@grpc/grpc-js');
// end grpc
const { StatusCodes } = require('../enums/StatusCodes');
const { createLogger } = require('../utils/Logger');

const log = createLogger('error');

class ValidationError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.name = 'ValidationError';
        this.errorCode = errorCode;
    }
}

// start grpc
const httpToGrpcStatus = (httpStatus) => {
    const map = {
        200: grpc.status.OK,
        400: grpc.status.INVALID_ARGUMENT,
        401: grpc.status.UNAUTHENTICATED,
        403: grpc.status.PERMISSION_DENIED,
        404: grpc.status.NOT_FOUND,
        409: grpc.status.ALREADY_EXISTS,
        429: grpc.status.RESOURCE_EXHAUSTED,
        500: grpc.status.INTERNAL,
        501: grpc.status.UNIMPLEMENTED,
        503: grpc.status.UNAVAILABLE,
    };
    return map[httpStatus] !== undefined ? map[httpStatus] : grpc.status.UNKNOWN;
};
// end grpc

/**
 * A single error handler exposing one entry point per transport: rest, grpc, socket, cron.
 */
class CustomErrorHandler {
    static rest = (err, _req, res, next) => {
        if (err && err.name === 'ValidationError') {
            return res
                .status(err.errorCode || StatusCodes.BAD_REQUEST)
                .json({ error: err.message });
        }
        return next(err);
    };

    // start grpc
    static grpc = (err) => {
        if (
            err &&
            typeof err === 'object' &&
            'code' in err &&
            'message' in err &&
            'metadata' in err
        ) {
            return err;
        }
        if (err instanceof ValidationError || (err && err.name === 'ValidationError')) {
            const httpStatus = err.errorCode || StatusCodes.BAD_REQUEST;
            return {
                name: 'ValidationError',
                message: err.message,
                code: httpToGrpcStatus(httpStatus),
                details: err.message,
                metadata: new grpc.Metadata(),
            };
        }
        if (err && err.response && typeof err.response.status === 'number') {
            return {
                name: 'GrpcError',
                message: err.response.message,
                code: httpToGrpcStatus(err.response.status),
                details: err.response.message,
                metadata: new grpc.Metadata(),
            };
        }
        return {
            name: (err && err.name) || 'InternalError',
            message: (err && err.message) || 'Internal server error',
            code: grpc.status.INTERNAL,
            details: (err && err.message) || 'Internal server error',
            metadata: new grpc.Metadata(),
        };
    };
    // end grpc

    // start socket
    static socket = (err, socket) => {
        log.error({ err: err && err.message }, 'Socket error');
        socket.emit('error', { message: (err && err.message) || 'Internal server error' });
    };
    // end socket

    // start cron
    static cron = (err, jobName = 'cron') => {
        log.error({ err: err && err.message, job: jobName }, 'Cron job error');
    };
    // end cron
}

module.exports = CustomErrorHandler.rest;
module.exports.default = CustomErrorHandler.rest;
module.exports.CustomErrorHandler = CustomErrorHandler;
module.exports.ValidationError = ValidationError;
// start grpc
module.exports.httpToGrpcStatus = httpToGrpcStatus;
// end grpc
module.exports.RestCustomErrorHandler = CustomErrorHandler.rest;
// start grpc
module.exports.GrpcCustomErrorHandler = CustomErrorHandler.grpc;
// end grpc
// start socket
module.exports.SocketCustomErrorHandler = CustomErrorHandler.socket;
// end socket
// start cron
module.exports.CronCustomErrorHandler = CustomErrorHandler.cron;
// end cron
module.exports.customErrorHandler = CustomErrorHandler.rest;
// start grpc
module.exports.grpcCustomErrorHandler = CustomErrorHandler.grpc;
// end grpc
