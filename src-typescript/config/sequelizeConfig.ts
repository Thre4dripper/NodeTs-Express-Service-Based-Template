import * as path from 'path';

require('dotenv').config();
import * as fs from 'fs';
import { Op, Dialect } from 'sequelize';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { createLogger } from '../app/utils/Logger';

const log = createLogger('sequelize');

/**
 * Build env-driven SSL config for Sequelize dialects.
 * Enable with DB_SSL=true; DB_SSL_REJECT_UNAUTHORIZED=false allows self-signed;
 * DB_SSL_CA_FILE points at a CA bundle (PEM).
 */
const buildSequelizeSsl = ():
    | boolean
    | { require: boolean; rejectUnauthorized: boolean; ca?: string } => {
    if ((process.env.DB_SSL || 'false').toLowerCase() !== 'true') {
        return false;
    }
    const ssl: { require: boolean; rejectUnauthorized: boolean; ca?: string } = {
        require: true,
        rejectUnauthorized:
            (process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false',
    };
    if (process.env.DB_SSL_CA_FILE) {
        ssl.ca = fs.readFileSync(process.env.DB_SSL_CA_FILE, 'utf-8');
    }
    return ssl;
};

const sequelizeOptions: SequelizeOptions = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: (process.env.DB_DIALECT as Dialect) || 'postgres',
    dialectOptions: {
        ssl: buildSequelizeSsl(),
    },
    models: [path.join(__dirname, '..', 'app', 'models')],
    logging: (msg) => log.debug(msg),
    operatorsAliases: {
        $eq: Op.eq,
        $ne: Op.ne,
        $gte: Op.gte,
        $gt: Op.gt,
        $lte: Op.lte,
        $lt: Op.lt,
        $not: Op.not,
        $in: Op.in,
        $notIn: Op.notIn,
        $is: Op.is,
        $like: Op.like,
        $notLike: Op.notLike,
        $iLike: Op.iLike,
        $notILike: Op.notILike,
        $regexp: Op.regexp,
        $notRegexp: Op.notRegexp,
        $iRegexp: Op.iRegexp,
        $notIRegexp: Op.notIRegexp,
        $between: Op.between,
        $notBetween: Op.notBetween,
        $overlap: Op.overlap,
        $contains: Op.contains,
        $contained: Op.contained,
        $adjacent: Op.adjacent,
        $strictLeft: Op.strictLeft,
        $strictRight: Op.strictRight,
        $noExtendRight: Op.noExtendRight,
        $noExtendLeft: Op.noExtendLeft,
        $and: Op.and,
        $or: Op.or,
        $any: Op.any,
        $all: Op.all,
        $values: Op.values,
        $col: Op.col,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    retry: {
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /ESOCKETTIMEDOUT/,
            /EHOSTUNREACH/,
            /EPIPE/,
            /EAI_AGAIN/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
        ],
        max: 3,
    },
};

export const sequelize = new Sequelize(sequelizeOptions);

export const sequelizeConnect = async () => {
    try {
        await sequelize.authenticate();
        log.info('Database connected successfully');
        await sequelize.sync({ alter: false });
        log.info('Database synced successfully');
    } catch (err) {
        log.error({ err }, 'Unable to connect to the database');
        throw err;
    }
};
