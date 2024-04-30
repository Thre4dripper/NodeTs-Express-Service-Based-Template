import { Server, Socket } from 'socket.io';
import http from 'http';
import MasterController from '../app/utils/MasterController';
import asyncHandler from '../app/utils/AsyncHandler';

class SocketConfig {
    /**
     * @description Method to initialize the socket io instance
     * @param server http server instance
     */
    static init = (server: http.Server) => {
        return new Server(server, {
            /* Socket.IO options (if needed) */
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
    };

    /**
     * @description This method is used to handle the socket connection and listen for events
     * @param io socket io instance
     * @param socket socket instance
     */
    static socketListener = (io: Server, socket: Socket) => {
        console.log('New client connected');
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        MasterController.getSocketRequests().forEach((client) => {
            socket.on(client.event, (payload) => {
                asyncHandler(client.masterController.socketController({ io, socket, payload }));
            });
        });
    };
}

export default SocketConfig;
