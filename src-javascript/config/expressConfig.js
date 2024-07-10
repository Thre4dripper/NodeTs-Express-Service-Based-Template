const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const joiErrorHandler = require('../app/handlers/JoiErrorHandler');
const customErrorHandler = require('../app/handlers/CustomErrorHandler');
const fs = require('fs').promises;
const path = require('path');
// start swagger import
const swaggerUI = require('swagger-ui-express');
const { default: SwaggerConfig } = require('./swaggerConfig');
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

    const loadRouters = async (dir) => {
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
        path: path.join(__dirname, '../../swagger.json'),
        modify: false,
    });
    // end swagger config

    await loadRouters(path.join(__dirname, '../app/routes'));

    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(SwaggerConfig.getSwaggerDocument()));

    app.use(joiErrorHandler, customErrorHandler, (err, _req, res, _next) => {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
    });

    // no route found
    app.use((_req, res) => {
        return res.status(404).json({ error: 'Route Not Found' });
    });

    return app;
};

module.exports = server;
