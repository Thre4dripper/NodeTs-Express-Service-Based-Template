import mongoose, { ConnectOptions } from 'mongoose';
import * as process from 'process';
import { createLogger } from '../app/utils/Logger';

require('dotenv').config();
const log = createLogger('mongoose');

/**
 * Build env-driven TLS/SSL options for MongoDB.
 * Enable with DB_SSL=true; optionally point DB_SSL_CA_FILE at a CA bundle and
 * set DB_SSL_REJECT_UNAUTHORIZED=false to allow self-signed certs.
 */
const buildSslOptions = (): ConnectOptions => {
    if ((process.env.DB_SSL || 'false').toLowerCase() !== 'true') {
        return {};
    }
    const options: ConnectOptions = {
        tls: true,
        tlsAllowInvalidCertificates:
            (process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'false',
    };
    if (process.env.DB_SSL_CA_FILE) {
        options.tlsCAFile = process.env.DB_SSL_CA_FILE;
    }
    return options;
};

const mongooseOptions: ConnectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    ...buildSslOptions(),
};

export const mongooseConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!, mongooseOptions);
        log.info('Database connected successfully');
    } catch (err) {
        log.error({ err }, 'Unable to connect to the database');
        throw err;
    }
};
