const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { createLogger } = require('../app/utils/Logger');

const log = createLogger('grpc');

// JS tree loads protos at runtime (no codegen). Protos live in the TS tree's proto dir.
const PROTO_DIR = path.join(__dirname, '../../src-typescript/proto');

/**
 * Load a proto package definition at runtime. The whole proto dir is on the
 * include path so cross-file imports resolve.
 */
const loadProto = (relativeFile) => {
    // Pass the path relative to includeDirs so the main file and its cross-file
    // imports resolve without warnings.
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
 * Dynamically load every `*.grpc.js` module and let each register its services.
 */
const loadGrpcRoutes = async (server, dir) => {
    if (!fs.existsSync(dir)) return;
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await loadGrpcRoutes(server, fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.grpc.js')) {
            try {
                const mod = require(fullPath);
                const register = mod.default || mod;
                if (typeof register === 'function') {
                    register(server);
                    log.info(`Loaded gRPC module: ${entry.name}`);
                }
            } catch (err) {
                log.warn({ err: err.message }, `Skipped gRPC module: ${entry.name}`);
            }
        }
    }
};

/**
 * Health service — all four streaming variants, always enabled.
 */
const setupHealthCheck = (server) => {
    try {
        const proto = loadProto('shared/health.proto');
        const healthService = proto.shared.Health.service;

        server.addService(healthService, {
            unaryHealthCheck: (_call, callback) => callback(null, { status: 'SERVING' }),
            serverStreamingHealthCheck: (call) => {
                call.write({ status: 'SERVING' });
                call.end();
            },
            clientStreamingHealthCheck: (call, callback) => {
                call.on('data', () => {});
                call.on('end', () => callback(null, { status: 'SERVING' }));
            },
            bidirectionalStreamingHealthCheck: (call) => {
                call.on('data', () => call.write({ status: 'SERVING' }));
                call.on('end', () => call.end());
            },
        });
        log.info('Health check service enabled');
    } catch (err) {
        log.warn({ err: err.message }, 'Failed to enable health check service');
    }
};

/**
 * gRPC reflection (dev only).
 */
const setupReflection = (server) => {
    try {
        const { ReflectionService } = require('@grpc/reflection');
        const protoFiles = [];

        const collect = (dir) => {
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
        log.warn({ err: err.message }, 'Failed to setup reflection');
    }
};

const buildGrpcServer = async () => {
    const server = new grpc.Server();

    await loadGrpcRoutes(server, path.join(__dirname, '../app/grpc'));
    setupHealthCheck(server);

    const env = (process.env.NODE_ENV || 'development').toLowerCase();
    const isDev = env === 'development' || env === 'dev' || env === 'local';
    if (isDev) setupReflection(server);

    return server;
};

const startGrpcServer = (server, port = 50051) => {
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

module.exports.loadProto = loadProto;
module.exports.buildGrpcServer = buildGrpcServer;
module.exports.startGrpcServer = startGrpcServer;
