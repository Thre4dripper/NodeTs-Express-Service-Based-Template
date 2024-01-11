import http from 'http'
import serverConfig from './config/expressConfig'
import * as process from 'process'
// mongoose import
import { mongooseConnect } from './config/mongooseConfig'
// sequelize import
import { sequelizeConnect } from './config/sequelizeConfig'
// socket import
import SocketConfig from './config/socketConfig'

require('dotenv').config()

const port = process.env.PORT || 3000
;(async () => {
    const app = await serverConfig()

    // getting the dialect from .env file
    if (!process.env.DB_DIALECT) {
        throw new Error('DB_DIALECT not found in .env file')
    }

    // start if dialect valid
    if (process.env.DB_DIALECT !== 'postgres' && process.env.DB_DIALECT !== 'mysql' &&
        process.env.DB_DIALECT !== 'mariadb' && process.env.DB_DIALECT !== 'sqlite' &&
        process.env.DB_DIALECT !== 'mssql' && process.env.DB_DIALECT !== 'db2' &&
        process.env.DB_DIALECT !== 'snowflake' && process.env.DB_DIALECT !== 'oracle' &&
        process.env.DB_DIALECT !== 'mongodb') {
        throw new Error('DB_DIALECT must be either postgres, mysql, mariadb, sqlite or mongodb')
    }
    // end if dialect valid

    // Connect to the database
    // start if sequelize dialect check
    if (process.env.DB_DIALECT === 'postgres' || process.env.DB_DIALECT === 'mysql' ||
        process.env.DB_DIALECT === 'mariadb' || process.env.DB_DIALECT === 'sqlite' ||
        process.env.DB_DIALECT === 'mssql' || process.env.DB_DIALECT === 'db2' ||
        process.env.DB_DIALECT === 'snowflake' || process.env.DB_DIALECT === 'oracle') {
        try {
            await sequelizeConnect()
        } catch (err) {
            console.error('Unable to connect to the database:', err)
            throw err
        }
    }
        // end if sequelize dialect check
    // start if mongoose dialect check
    else if (process.env.DB_DIALECT === 'mongodb') {
        try {
            await mongooseConnect()
        } catch (err) {
            console.error('Unable to connect to the database:', err)
            throw err
        }
    }
    // end if mongoose dialect check
    // Create an HTTP server instance
    const httpServer = http.createServer(app)

    // Initialize Socket.IO with the HTTP server
    const io = SocketConfig.init(httpServer)

    io.on('connection', (socket) => {
        SocketConfig.socketListener(io, socket)
    })
    // End Initialize Socket.IO

    // Start listening for HTTP requests
    httpServer.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    })
})()