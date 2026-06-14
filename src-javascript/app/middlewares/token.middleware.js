/**
 * REST token middleware — CONSUMER style (JS mirror).
 * Extracts the bearer token to req.token for forwarding; does not verify locally.
 */
const tokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    if (authHeader.split(' ').length !== 2) {
        return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    req.token = authHeader.split(' ')[1];
    return next();
};

module.exports.tokenMiddleware = tokenMiddleware;
