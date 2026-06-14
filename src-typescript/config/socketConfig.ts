import { Server, Socket } from 'socket.io';
import http from 'http';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import MasterController from '../app/utils/MasterController';
import asyncHandler from '../app/utils/AsyncHandler';
import { createLogger } from '../app/utils/Logger';

const log = createLogger('socket');

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
     * @description Recursively load all `*.socket.ts|js` modules so their
     * controllers self-register socket events via `MasterController.socketIO()`.
     * Mirrors the per-transport loader pattern used for routes/crons/grpc.
     * @param dir directory to scan for socket modules
     */
    static InitSocketModules = async (dir: string) => {
        let entries: import('fs').Dirent[];
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await SocketConfig.InitSocketModules(fullPath);
            } else if (
                entry.isFile() &&
                (entry.name.endsWith('.socket.ts') || entry.name.endsWith('.socket.js'))
            ) {
                require(fullPath);
                log.info(`Loaded socket module: ${entry.name}`);
            }
        }
    };

    /**
     * @description This method is used to handle the socket connection and listen for events
     * @param io socket io instance
     * @param socket socket instance
     */
    static socketListener = (io: Server, socket: Socket) => {
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
    };
}

export default SocketConfig;
