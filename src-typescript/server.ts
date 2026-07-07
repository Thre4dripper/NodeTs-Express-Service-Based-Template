import http from 'http';
import serverConfig from './config/expressConfig';
import { mongooseConnect } from './config/mongooseConfig';
import { sequelizeConnect } from './config/sequelizeConfig';
import SocketConfig from './config/socketConfig';
import CronConfig from './config/cronConfig';
// start grpc import
import { buildGrpcServer, startGrpcServer } from './config/grpcConfig';
// end grpc import
// start redis import
import { redisConnect, redisDisconnect } from './app/common/redis.client';
// end redis import
// start grpc client import
import { GrpcClientFactory } from './app/utils/GrpcClientFactory';
// end grpc client import
import logger from './app/utils/Logger';
import * as path from 'node:path';

require('dotenv').config();

const port = process.env.PORT || 3000;
// start grpc port
const grpcPort = process.env.GRPC_PORT ? Number(process.env.GRPC_PORT) : 50051;
// end grpc port
(async () => {
    const app = await serverConfig();

    // getting the dialect from .env file
    if (!process.env.DB_DIALECT) {
        throw new Error('DB_DIALECT not found in .env file');
    }

    // start if dialect valid
    if (
        ![
            'postgres',
            'mysql',
            'mariadb',
            'sqlite',
            'mssql',
            'db2',
            'snowflake',
            'oracle',
            'mongodb',
        ].includes(process.env.DB_DIALECT)
    ) {
        throw new Error('DB_DIALECT must be either postgres, mysql, mariadb, sqlite or mongodb');
    }
    // end if dialect valid

    // Connect to the database
    // start if sequelize dialect check
    if (
        ['postgres', 'mysql', 'mariadb', 'sqlite', 'mssql', 'db2', 'snowflake', 'oracle'].includes(
            process.env.DB_DIALECT
        )
    ) {
        try {
            await sequelizeConnect();
        } catch (err) {
            logger.error({ err }, 'Unable to connect to the database');
            throw err;
        }
    }
    // end if sequelize dialect check
    // start if mongoose dialect check
    else if (process.env.DB_DIALECT === 'mongodb') {
        try {
            await mongooseConnect();
        } catch (err) {
            logger.error({ err }, 'Unable to connect to the database');
            throw err;
        }
    }
    // end if mongoose dialect check

    // start redis connect
    try {
        await redisConnect();
    } catch (err) {
        logger.error({ err }, 'Unable to connect to Redis');
        throw err;
    }
    // end redis connect

    // Create an HTTP server instance
    const httpServer = http.createServer(app);

    // Initialize Socket.IO with the HTTP server
    const io = SocketConfig.init(httpServer);

    // Load socket modules (app/sockets/*.socket.ts) so controllers self-register events
    await SocketConfig.InitSocketModules(path.join(__dirname, 'app/sockets'));

    io.on('connection', (socket) => {
        SocketConfig.socketListener(io, socket);
    });
    // End Initialize Socket.IO

    // Initialize Cron Jobs
    await CronConfig.InitCronJobs(path.join(__dirname, 'app/crons'), (pathToCron: string) => {
        // configurable import statement to load all the cron jobs before starting server
        // This lambda function is called for each cron job file found

        require(pathToCron);
    });
    CronConfig.startCronJobs();

    // End Initialize Cron Jobs

    // Start listening for HTTP requests
    httpServer.listen(port, () => {
        logger.info(`Server is listening on port ${port}`);
    });

    // start grpc bootstrap
    try {
        const grpcServer = await buildGrpcServer();
        await startGrpcServer(grpcServer, grpcPort);
    } catch (err) {
        logger.error({ err }, 'Failed to start gRPC server');
    }
    // end grpc bootstrap

    // start graceful shutdown
    // Graceful shutdown — close gRPC clients and Redis before exiting.
    const shutdown = async (signal: string) => {
        logger.info(`${signal} received — shutting down gracefully...`);
        try {
            // start grpc shutdown
            GrpcClientFactory.closeAllClients();
            // end grpc shutdown
            // start redis shutdown
            await redisDisconnect();
            // end redis shutdown
        } catch (err) {
            logger.error({ err }, 'Error during shutdown');
        }
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    // end graceful shutdown
})();
