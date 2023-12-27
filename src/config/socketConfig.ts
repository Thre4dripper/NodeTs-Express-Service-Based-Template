import { Server } from 'socket.io'
import http from 'http'

const socketConfig = (server: http.Server) => {
    return new Server(server, {
        /* Socket.IO options (if needed) */
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })
}

export default socketConfig
