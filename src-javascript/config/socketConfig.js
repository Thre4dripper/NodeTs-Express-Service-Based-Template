const { Server } = require('socket.io');
const fs = require('fs/promises');
const path = require('path');
const MasterController = require('../app/utils/MasterController');
const asyncHandler = require('../app/utils/AsyncHandler');
const { createLogger } = require('../app/utils/Logger');

const log = createLogger('socket');

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
     * @description Recursively load all `*.socket.js` modules so controllers
     * self-register socket events via MasterController.socketIO().
     * @param dir directory to scan for socket modules
     */
    static async InitSocketModules(dir) {
        let entries;
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await SocketConfig.InitSocketModules(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.socket.js')) {
                require(fullPath);
                log.info(`Loaded socket module: ${entry.name}`);
            }
        }
    }

    /**
     * @description This method is used to handle the socket connection and listen for events
     * @param io socket io instance
     * @param socket socket instance
     */
    static socketListener(io, socket) {
        log.info('New client connected');
        socket.on('disconnect', () => {
            log.info('Client disconnected');
        });
        MasterController.getSocketRequests().forEach((client) => {
            socket.on(client.event, (payload) => {
                asyncHandler(
                    (async () => {
                        client.masterController.socketController(io, socket, payload);
                    })()
                );
            });
        });
    }
}

module.exports = SocketConfig;
