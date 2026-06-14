const http = require('http');
const serverConfig = require('./config/expressConfig');
const process = require('process');
const { mongooseConnect } = require('./config/mongooseConfig');
const { sequelizeConnect } = require('./config/sequelizeConfig');
const SocketConfig = require('./config/socketConfig');
const CronConfig = require('./config/cronConfig');
const { buildGrpcServer, startGrpcServer } = require('./config/grpcConfig');
const { redisConnect, redisDisconnect } = require('./app/common/redis.client');
const GrpcClientFactory = require('./app/utils/GrpcClientFactory');
const logger = require('./app/utils/Logger');
const path = require('path');

require('dotenv').config();

const port = process.env.PORT || 3000;
const grpcPort = process.env.GRPC_PORT ? Number(process.env.GRPC_PORT) : 50051;

(async () => {
    const app = await serverConfig();

    // Getting the dialect from .env file
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

    // Connect to Redis (optional — remove this block if the service doesn't need it)
    try {
        await redisConnect();
    } catch (err) {
        logger.error({ err }, 'Unable to connect to Redis');
        throw err;
    }

    // Create an HTTP server instance
    const httpServer = http.createServer(app);
    // Initialize Socket.IO with the HTTP server
    const io = SocketConfig.init(httpServer);

    // Load socket modules (app/sockets/*.socket.js) so controllers self-register events
    await SocketConfig.InitSocketModules(path.join(__dirname, 'app/sockets'));

    io.on('connection', (socket) => {
        SocketConfig.socketListener(io, socket);
    });
    // End Initialize Socket.IO

    // Initialize Cron Jobs
    await CronConfig.InitCronJobs(path.join(__dirname, 'app/crons'));
    CronConfig.startCronJobs();

    // End Initialize Cron Jobs

    // Start listening for HTTP requests
    httpServer.listen(port, () => {
        logger.info(`Server is listening on port ${port}`);
    });
    // End listening for HTTP requests

    // Start gRPC server
    try {
        const grpcServer = await buildGrpcServer();
        await startGrpcServer(grpcServer, grpcPort);
    } catch (err) {
        logger.error({ err }, 'Failed to start gRPC server');
    }

    // Graceful shutdown — close gRPC clients and Redis before exiting.
    const shutdown = async (signal) => {
        logger.info(`${signal} received — shutting down gracefully...`);
        try {
            GrpcClientFactory.closeAllClients();
            await redisDisconnect();
        } catch (err) {
            logger.error({ err }, 'Error during shutdown');
        }
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
})();
