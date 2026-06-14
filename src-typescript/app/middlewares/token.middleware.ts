import { NextFunction, Request, Response } from 'express';

/**
 * REST token middleware — CONSUMER style.
 *
 * Does NOT verify the token locally. It only extracts the bearer token and
 * attaches it to `req.token` so the service can forward it (in gRPC metadata)
 * to the issuer/authority service for verification + authorization.
 * Use this in services that DELEGATE auth (see app/examples/remote.permission.example).
 */
export interface TokenRequest extends Request {
    token?: string;
}

export const tokenMiddleware = (req: TokenRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || (req.headers as any).Authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    if (authHeader.split(' ').length !== 2) {
        return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    req.token = authHeader.split(' ')[1];
    return next();
};
