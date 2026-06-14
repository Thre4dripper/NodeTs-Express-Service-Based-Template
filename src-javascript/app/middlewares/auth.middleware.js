const EncryptionUtil = require('../utils/EncryptionUtil');

/**
 * REST auth middleware — ISSUER / VERIFIER style (JS mirror).
 * Verifies the RS256 JWT locally and attaches the payload to req.user.
 */
const authenticateJwt = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

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

module.exports.authenticateJwt = authenticateJwt;
