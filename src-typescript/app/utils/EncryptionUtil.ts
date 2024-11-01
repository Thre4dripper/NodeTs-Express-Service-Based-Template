require('dotenv').config();
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IAccessToken } from '../common/interfaces';

export default class EncryptionUtil {
    static async hashPassword(password: string, rounds: number = 10) {
        return await bcrypt.hash(password, rounds);
    }

    static async comparePassword(enteredPassword: string, dbPassword: string) {
        return await bcrypt.compare(enteredPassword, dbPassword);
    }

    static generateJwtTokens(data: any): IAccessToken {
        return {
            accessToken: jwt.sign(data, process.env.JWT_SECRET!, {
                expiresIn: '2 days',
            }),
            refreshToken: jwt.sign(data, process.env.JWT_SECRET!, {
                expiresIn: '10 days',
            }),
        };
    }

    static verifyToken(token: string) {
        return jwt.verify(token, process.env.JWT_SECRET!);
    }
}
