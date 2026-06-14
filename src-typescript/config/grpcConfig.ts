import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { createLogger } from '../app/utils/Logger';

const log = createLogger('grpc');

// Local protos live next to the compiled output; resolve both ts-node (src) and dist.
const PROTO_DIR = path.join(__dirname, '../proto');

/**
 * Load a proto package definition at runtime (used for the health service and as
 * a codegen-free fallback). The whole proto dir is on the include path so
 * cross-file imports resolve.
 */
export const loadProto = (relativeFile: string): grpc.GrpcObject => {
    // Pass the path relative to includeDirs so the main file and its cross-file
    // imports (e.g. `import "shared/models.proto"`) resolve without warnings.
    const packageDefinition = protoLoader.loadSync(relativeFile, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [PROTO_DIR],
    });
    return grpc.loadPackageDefinition(packageDefinition);
};

/**
 * Dynamically load every `*.grpc.ts|js` module from app/grpc and let each register
 * its services on the server. Failures (e.g. missing generated stubs) are logged
 * but don't stop the server from booting.
 */
const loadGrpcRoutes = async (server: grpc.Server, dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await loadGrpcRoutes(server, fullPath);
        } else if (
            entry.isFile() &&
            (entry.name.endsWith('.grpc.ts') || entry.name.endsWith('.grpc.js'))
        ) {
            try {
                const mod = require(fullPath);
                const register = mod.default || mod;
                if (typeof register === 'function') {
                    register(server);
                    log.info(`Loaded gRPC module: ${entry.name}`);
                }
            } catch (err) {
                log.warn({ err: (err as Error).message }, `Skipped gRPC module: ${entry.name}`);
            }
        }
    }
};

/**
 * Health service — implements all four streaming variants, always enabled.
 * Loaded at runtime from shared/health.proto (no codegen required).
 */
const setupHealthCheck = (server: grpc.Server) => {
    try {
        const proto = loadProto('shared/health.proto') as any;
        const healthService = proto.shared.Health.service;

        server.addService(healthService, {
            unaryHealthCheck: (_call: any, callback: grpc.sendUnaryData<any>) => {
                callback(null, { status: 'SERVING' });
            },
            serverStreamingHealthCheck: (call: grpc.ServerWritableStream<any, any>) => {
                call.write({ status: 'SERVING' });
                call.end();
            },
            clientStreamingHealthCheck: (
                call: grpc.ServerReadableStream<any, any>,
                callback: grpc.sendUnaryData<any>
            ) => {
                call.on('data', () => {});
                call.on('end', () => callback(null, { status: 'SERVING' }));
            },
            bidirectionalStreamingHealthCheck: (call: grpc.ServerDuplexStream<any, any>) => {
                call.on('data', () => call.write({ status: 'SERVING' }));
                call.on('end', () => call.end());
            },
        });
        log.info('Health check service enabled');
    } catch (err) {
        log.warn({ err: (err as Error).message }, 'Failed to enable health check service');
    }
};

/**
 * gRPC server reflection (dev only) so grpcui / grpcurl can introspect services.
 */
const setupReflection = (server: grpc.Server) => {
    try {
        const { ReflectionService } = require('@grpc/reflection');
        const protoFiles: string[] = [];

        const collect = (dir: string) => {
            if (!fs.existsSync(dir)) return;
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory() && entry.name !== 'generated') collect(full);
                else if (entry.isFile() && entry.name.endsWith('.proto')) protoFiles.push(full);
            }
        };
        collect(PROTO_DIR);

        if (protoFiles.length === 0) {
            log.warn('No proto files found for reflection');
            return;
        }

        const packageDefinition = protoLoader.loadSync(protoFiles, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [PROTO_DIR],
        });

        new ReflectionService(packageDefinition).addToServer(server);
        log.info('gRPC reflection service enabled');
    } catch (err) {
        log.warn({ err: (err as Error).message }, 'Failed to setup reflection');
    }
};

/**
 * Build and configure the gRPC server (load modules + health + dev reflection).
 */
export const buildGrpcServer = async (): Promise<grpc.Server> => {
    const server = new grpc.Server();

    await loadGrpcRoutes(server, path.join(__dirname, '../app/grpc'));
    setupHealthCheck(server);

    const env = (process.env.NODE_ENV || 'development').toLowerCase();
    const isDev = env === 'development' || env === 'dev' || env === 'local';
    if (isDev) setupReflection(server);

    return server;
};

/**
 * Bind + start the gRPC server (insecure; front with TLS termination in prod).
 */
export const startGrpcServer = (server: grpc.Server, port = 50051): Promise<number> => {
    return new Promise((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (err, boundPort) => {
                if (err) {
                    log.error({ err }, 'Failed to start gRPC server');
                    return reject(err);
                }
                log.info(`gRPC server running on port ${boundPort}`);
                resolve(boundPort);
            }
        );
    });
};
