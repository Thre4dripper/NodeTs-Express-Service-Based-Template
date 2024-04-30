const { Server } = require('socket.io');
const MasterController = require('../app/utils/MasterController');
const asyncHandler = require('../app/utils/AsyncHandler');

class SocketConfig {
    /**
     * @description Method to initialize the socket io instance
     * @param server http server instance
     */
    static init(server) {
        return new Server(server, {
            /* Socket.IO options (if needed) */
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
    }

    /**
     * @description This method is used to handle the socket connection and listen for events
     * @param io socket io instance
     * @param socket socket instance
     */
    static socketListener(io, socket) {
        console.log('New client connected');
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
        MasterController.getSocketRequests().forEach((client) => {
            socket.on(client.event, (payload) => {
                asyncHandler(client.masterController.socketController({ io, socket, payload }));
            });
        });
    }
}

module.exports = SocketConfig;
