import http from 'http'
import serverConfig from './config/expressConfig'

require('dotenv').config()

const port = process.env.PORT || 3000
;(async () => {
    const app = await serverConfig()
    // Create an HTTP server instance
    const httpServer = http.createServer(app)

    // Integrate Socket.IO with the HTTP server
    // const io = socketConfig(httpServer)
    //
    // io.on(SocketEvents.CONNECTION, SocketController.listener)

    // Start listening for HTTP requests
    httpServer.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    })
})()