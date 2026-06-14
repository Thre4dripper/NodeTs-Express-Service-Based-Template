import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import * as grpc from '@grpc/grpc-js';
import { Socket } from 'socket.io';
import { createLogger } from '../utils/Logger';

const log = createLogger('error');

const formatJoi = (err: Joi.ValidationError) => err.details.map((e) => e.message).join(', ');

/**
 * A single Joi error handler exposing one entry point per transport: rest, grpc, socket, cron.
 */
export class JoiErrorHandler {
    /** Express error-handling middleware for Joi validation errors. */
    static rest = (err: Error, _req: Request, res: Response, next: NextFunction) => {
        if (err instanceof Joi.ValidationError) {
            return res.status(400).json({ error: formatJoi(err) });
        }
        return next(err);
    };

    /** Convert a Joi validation error to a gRPC ServiceError (null if not a Joi error). */
    static grpc = (err: any): grpc.ServiceError | null => {
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

    /** Emit a Joi validation error to a socket client (returns true if handled). */
    static socket = (err: any, socket: Socket): boolean => {
        if (err instanceof Joi.ValidationError) {
            socket.emit('error', { message: formatJoi(err) });
            return true;
        }
        return false;
    };

    /** Log a Joi validation error from a cron job (returns true if handled). */
    static cron = (err: any, jobName = 'cron'): boolean => {
        if (err instanceof Joi.ValidationError) {
            log.error({ err: formatJoi(err), job: jobName }, 'Cron validation error');
            return true;
        }
        return false;
    };
}

// ─── Named exports (Rest-prefixed + transport-specific + legacy aliases) ────────
export const RestJoiErrorHandler = JoiErrorHandler.rest;
export const GrpcJoiErrorHandler = JoiErrorHandler.grpc;
export const SocketJoiErrorHandler = JoiErrorHandler.socket;
export const CronJoiErrorHandler = JoiErrorHandler.cron;

/** @deprecated use RestJoiErrorHandler */
export const joiErrorHandler = JoiErrorHandler.rest;
/** Convert a Joi error to a gRPC ServiceError. */
export const grpcJoiErrorHandler = JoiErrorHandler.grpc;

export default JoiErrorHandler.rest;
