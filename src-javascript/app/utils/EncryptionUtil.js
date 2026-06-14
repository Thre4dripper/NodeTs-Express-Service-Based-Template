require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const { SignJWT, jwtVerify, exportJWK } = require('jose');

/**
 * Cryptography helpers: bcrypt + RS256 JWT via jose + JWKS export (JS mirror).
 * Generate a key pair with: pnpm keys:generate
 */
class EncryptionUtil {
    static privateKey = null;
    static publicKey = null;
    static kid = 'default';

    static async hashPassword(password, salt = 10) {
        return await bcrypt.hash(password, salt);
    }

    static async comparePassword(enteredPassword, dbPassword) {
        return await bcrypt.compare(enteredPassword, dbPassword);
    }

    static loadKeys() {
        if (this.privateKey) return this.privateKey;

        let pem;
        if (process.env.JWT_PRIVATE_KEY) {
            pem = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
        } else if (
            process.env.JWT_PRIVATE_KEY_PATH &&
            fs.existsSync(process.env.JWT_PRIVATE_KEY_PATH)
        ) {
            pem = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH, 'utf-8');
        }
        if (!pem) {
            throw new Error(
                'No JWT private key found. Set JWT_PRIVATE_KEY or JWT_PRIVATE_KEY_PATH (run: pnpm keys:generate)'
            );
        }

        this.privateKey = crypto.createPrivateKey(pem);
        this.publicKey = crypto.createPublicKey(this.privateKey);

        const der = this.publicKey.export({ type: 'spki', format: 'der' });
        this.kid = crypto.createHash('sha256').update(der).digest('hex').substring(0, 16);

        return this.privateKey;
    }

    static async generateJwtTokens(data) {
        const privateKey = this.loadKeys();
        const header = { alg: 'RS256', kid: this.kid };

        const accessToken = await new SignJWT(data)
            .setProtectedHeader(header)
            .setIssuedAt()
            .setExpirationTime('2d')
            .sign(privateKey);

        const refreshToken = await new SignJWT(data)
            .setProtectedHeader(header)
            .setIssuedAt()
            .setExpirationTime('10d')
            .sign(privateKey);

        return { accessToken, refreshToken };
    }

    static async verifyToken(token) {
        this.loadKeys();
        const { payload } = await jwtVerify(token, this.publicKey, { algorithms: ['RS256'] });
        return payload;
    }

    static async getPublicJwks() {
        this.loadKeys();
        const jwk = await exportJWK(this.publicKey);
        return {
            keys: [{ ...jwk, kid: this.kid, use: 'sig', alg: 'RS256' }],
        };
    }
}

module.exports = EncryptionUtil;
