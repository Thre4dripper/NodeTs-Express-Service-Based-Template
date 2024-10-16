import http from 'http';
import serverConfig from './config/expressConfig';
import * as process from 'process';
import { mongooseConnect } from './config/mongooseConfig';
import { sequelizeConnect } from './config/sequelizeConfig';
import SocketConfig from './config/socketConfig';
import CronConfig from './config/cronConfig';
import * as path from 'node:path';

require('dotenv').config();

const port = process.env.PORT || 3000;
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
            console.error('Unable to connect to the database:', err);
            throw err;
        }
    }
    // end if sequelize dialect check
    // start if mongoose dialect check
    else if (process.env.DB_DIALECT === 'mongodb') {
        try {
            await mongooseConnect();
        } catch (err) {
            console.error('Unable to connect to the database:', err);
            throw err;
        }
    }
    // end if mongoose dialect check
    // Create an HTTP server instance
    const httpServer = http.createServer(app);

    // Initialize Socket.IO with the HTTP server
    const io = SocketConfig.init(httpServer);

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
        console.log(`Server is listening on port ${port}`);
    });
})();
