import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { RestJoiErrorHandler } from '../app/handlers/JoiErrorHandler';
import { RestCustomErrorHandler } from '../app/handlers/CustomErrorHandler';
import * as fs from 'fs/promises';
import * as path from 'path';
import logger from '../app/utils/Logger';
// start swagger import
import swaggerUI from 'swagger-ui-express';
import SwaggerConfig from './swaggerConfig';
// end swagger import

const server = async () => {
    const app = express();
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check (kept above the request logger so it doesn't spam logs)
    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).type('text/plain').send('OK');
    });

    app.use(pinoHttp({ logger }));
    app.use(
        cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'Accept',
                'Origin',
                'Access-Control-Allow-Headers',
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Accept-Encoding',
                'Accept-Language',
                'Cache-Control',
                'Connection',
                'Content-Length',
                'Host',
                'Pragma',
                'Referer',
                'User-Agent',
                'X-Forwarded-For',
                'X-Forwarded-Proto',
            ],
            exposedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'Accept',
                'Origin',
                'Access-Control-Allow-Headers',
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Accept-Encoding',
                'Accept-Language',
                'Cache-Control',
                'Connection',
                'Content-Length',
                'Host',
                'Pragma',
                'Referer',
                'User-Agent',
                'X-Forwarded-For',
                'X-Forwarded-Proto',
            ],
            optionsSuccessStatus: 204,
            credentials: true,
            preflightContinue: false,
        })
    );
    const loadRouters = async (dir: string) => {
        //load all routers from dir and sub dir
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                //recursive call to sub dir
                await loadRouters(fullPath);
            } else if (
                entry.isFile() &&
                (entry.name.endsWith('.routes.ts') || entry.name.endsWith('.routes.js'))
            ) {
                const router = require(fullPath);
                //to support both default exports in commonjs and es6
                if (router.default) router.default(app);
                else router(app);
            }
        }
    };
    // start swagger config
    const env = (process.env.NODE_ENV || 'development').toLowerCase();
    const isDev = env === 'development' || env === 'dev' || env === 'local';

    SwaggerConfig.initSwagger({
        title: 'Node Swagger API',
        description: 'Demonstrating how to describe a RESTful API with Swagger',
        version: '1.0.0',
        swaggerDocPath: path.join(__dirname, '../../swagger.json'),
        modifySwaggerDoc: isDev,
    });
    // end swagger config
    await loadRouters(path.join(__dirname, '../app/routes'));

    // Swagger UI + on-disk doc generation are development-only.
    if (isDev) {
        SwaggerConfig.finalizeSwagger();
        app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(SwaggerConfig.getSwaggerDocument()));
    }
    app.use(
        RestJoiErrorHandler,
        RestCustomErrorHandler,
        (err: any, _req: Request, res: Response, _next: NextFunction) => {
            logger.error({ err }, 'Unhandled error');
            return res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
        }
    );

    // no route found
    app.use((_req: Request, res: Response) => {
        return res.status(404).json({ error: 'Route Not Found' });
    });
    return app;
};

export default server;
