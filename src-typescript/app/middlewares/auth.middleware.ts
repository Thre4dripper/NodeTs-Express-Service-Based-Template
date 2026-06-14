import { NextFunction, Request, Response } from 'express';
import EncryptionUtil from '../utils/EncryptionUtil';

/**
 * REST auth middleware — ISSUER / VERIFIER style.
 *
 * Verifies the RS256 JWT locally (using this service's keys / JWKS) and attaches
 * the decoded payload to `req.user`. Use this in services that ISSUE tokens.
 * Consumer services that only forward tokens should use token.middleware.ts instead.
 */
export interface AuthedRequest extends Request {
    user?: Record<string, any>;
}

export const authenticateJwt = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || (req.headers as any).Authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const payload = await EncryptionUtil.verifyToken(token);
        req.user = payload;
        return next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
