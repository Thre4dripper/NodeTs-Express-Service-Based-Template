import http from 'http'
import serverConfig from './config/expressConfig'
// import { sequelizeConnect } from './config/sequelizeConfig'
import socketConfig from './config/socketConfig'
import MasterController from './app/utils/MasterController'
import { mongooseConnect } from './config/mongooseConfig'
import * as process from 'process'
import { sequelizeConnect } from './config/sequelizeConfig'

require('dotenv').config()

const port = process.env.PORT || 3000
;(async () => {
    const app = await serverConfig()

    // getting the dialect from .env file
    if (!process.env.DB_DIALECT) {
        throw new Error('DB_DIALECT not found in .env file')
    }

    // Connect to the database
    if (process.env.DB_DIALECT === 'postgres' || process.env.DB_DIALECT === 'mysql' || process.env.DB_DIALECT === 'mariadb' || process.env.DB_DIALECT === 'sqlite') {
        sequelizeConnect().catch((err) => {
            console.error('Unable to connect to the database:', err)
            throw err
        })
    } else if (process.env.DB_DIALECT === 'mongodb') {
        mongooseConnect().catch((err) => {
            console.error('Unable to connect to the database:', err)
            throw err
        })
    } else {
        throw new Error('DB_DIALECT must be either postgres, mysql, mariadb, sqlite or mongodb')
    }

    // Create an HTTP server instance
    const httpServer = http.createServer(app)

    // Integrate Socket.IO with the HTTP server
    const io = socketConfig(httpServer)

    io.on('connection', (socket) => {
        MasterController.socketListener(io, socket)
    })

    // Start listening for HTTP requests
    httpServer.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    })
})()