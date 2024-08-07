import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import joiErrorHandler from '../app/handlers/JoiErrorHandler';
import customErrorHandler from '../app/handlers/CustomErrorHandler';
import * as fs from 'fs/promises';
import * as path from 'path';
// start swagger import
import swaggerUI from 'swagger-ui-express';
import SwaggerConfig from './swaggerConfig';
// end swagger import

const server = async () => {
    const app = express();
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
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
    SwaggerConfig.initSwagger({
        title: 'Node Swagger API',
        description: 'Demonstrating how to describe a RESTful API with Swagger',
        version: '1.0.0',
        swaggerDocPath: path.join(__dirname, '../../swagger.json'),
        modifySwaggerDoc: false,
    });
    // end swagger config
    await loadRouters(path.join(__dirname, '../app/routes'));
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(SwaggerConfig.getSwaggerDocument()));
    app.use(
        joiErrorHandler,
        customErrorHandler,
        (err: any, _req: Request, res: Response, _next: NextFunction) => {
            console.error(err); // Log the error for debugging
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
