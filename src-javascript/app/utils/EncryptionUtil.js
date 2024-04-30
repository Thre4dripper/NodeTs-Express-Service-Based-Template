require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class EncryptionUtil {
    static async hashPassword(password, salt = 10) {
        return await bcrypt.hash(password, salt);
    }

    static async comparePassword(enteredPassword, dbPassword) {
        return await bcrypt.compare(enteredPassword, dbPassword);
    }

    static generateJwtTokens(data) {
        return {
            accessToken: jwt.sign(data, process.env.JWT_SECRET, {
                expiresIn: '2 days',
            }),
            refreshToken: jwt.sign(data, process.env.JWT_SECRET, {
                expiresIn: '10 days',
            }),
        };
    }

    static verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}

module.exports = EncryptionUtil;
