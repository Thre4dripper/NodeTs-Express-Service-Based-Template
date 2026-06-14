const mongoose = require('mongoose');
const process = require('process');
require('dotenv').config();
const { createLogger } = require('../app/utils/Logger');

const log = createLogger('mongoose');

const buildSslOptions = () => {
    if ((process.env.DB_SSL || 'false').toLowerCase() !== 'true') {
        return {};
    }
    const options = {
        tls: true,
        tlsAllowInvalidCertificates:
            (process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'false',
    };
    if (process.env.DB_SSL_CA_FILE) {
        options.tlsCAFile = process.env.DB_SSL_CA_FILE;
    }
    return options;
};

const mongooseOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    ...buildSslOptions(),
};

const mongooseConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
        log.info('Database connected successfully');
    } catch (err) {
        log.error({ err }, 'Unable to connect to the database');
        throw err;
    }
};

exports.mongooseConnect = mongooseConnect;
