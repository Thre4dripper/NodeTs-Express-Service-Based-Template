import http from 'http'
import serverConfig from './config/expressConfig'
import { sequelize } from './config/sequelizeConfig'
import socketConfig from './config/socketConfig'
import MasterController from './app/utils/MasterController'

require('dotenv').config()

const port = process.env.PORT || 3000
;(async () => {
    const app = await serverConfig()

    try {
        await (async () => {
            await sequelize.authenticate()
            console.log('\x1b[32m%s\x1b[0m', 'Database Connected successfully.')
            await sequelize.sync({ alter: false })
            console.log('\x1b[32m%s\x1b[0m', 'Database Synced successfully.')
        })()
    } catch (err) {
        console.error('Unable to connect to the database:', err)
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