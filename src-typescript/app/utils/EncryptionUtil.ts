require('dotenv').config();
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { SignJWT, jwtVerify, exportJWK } from 'jose';
import { IAccessToken } from '../common/interfaces';

/**
 * Cryptography helpers: bcrypt password hashing + RS256 JWT signing/verification
 * via `jose`, plus a JWKS export so other services can verify tokens without the
 * private key (publish at `/.well-known/jwks.json`).
 *
 * Generate a key pair with: `pnpm keys:generate`
 */
export default class EncryptionUtil {
    private static privateKey: crypto.KeyObject | null = null;
    private static publicKey: crypto.KeyObject | null = null;
    private static kid = 'default';

    static async hashPassword(password: string, salt: number = 10) {
        return await bcrypt.hash(password, salt);
    }

    static async comparePassword(enteredPassword: string, dbPassword: string) {
        return await bcrypt.compare(enteredPassword, dbPassword);
    }

    /**
     * Load the RSA private key from JWT_PRIVATE_KEY (inline PEM, \n-escaped) or
     * JWT_PRIVATE_KEY_PATH (file). Derives a stable `kid` from the public key.
     */
    private static loadKeys(): crypto.KeyObject {
        if (this.privateKey) return this.privateKey;

        let pem: string | undefined;
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

    /**
     * Sign access (2d) + refresh (10d) tokens with RS256.
     */
    static async generateJwtTokens(data: Record<string, any>): Promise<IAccessToken> {
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

    /**
     * Verify a token against the RS256 public key.
     */
    static async verifyToken(token: string): Promise<Record<string, any>> {
        this.loadKeys();
        const { payload } = await jwtVerify(token, this.publicKey!, { algorithms: ['RS256'] });
        return payload as Record<string, any>;
    }

    /**
     * Public key in JWKS form for `/.well-known/jwks.json`.
     */
    static async getPublicJwks(): Promise<{ keys: any[] }> {
        this.loadKeys();
        const jwk = await exportJWK(this.publicKey!);
        return {
            keys: [{ ...jwk, kid: this.kid, use: 'sig', alg: 'RS256' }],
        };
    }
}
