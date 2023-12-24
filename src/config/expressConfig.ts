import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { sequelize } from './sequelizeConfig'
import morgan from 'morgan'
import joiErrorHandler from "../app/handlers/JoiErrorHandler";
import customErrorHandler from "../app/handlers/CustomErrorHandler";

const server = async () => {
    const app = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
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
    )
    // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getFinalSwagger()));
    // allRoutes.forEach((route) => {
    //     app.use(route)
    // })
    app.use(
        joiErrorHandler,
        customErrorHandler,
        (err: any, _req: Request, res: Response) => {
            console.error(err) // Log the error for debugging
            return res.status(500).json({ error: 'Internal Server Error' }) // Respond with a 500 Internal Server Error
        }
    )

    // no route found
    app.use(function (_req, res) {
        return res.status(404).json({
            message: 'Route not found.',
        })
    })

    try {
        await (async () => {
            await sequelize.authenticate()
            console.log('\x1b[32m%s\x1b[0m', 'Database Connected successfully.')
            await sequelize.sync({ alter: false })
            console.log('\x1b[32m%s\x1b[0m', 'Database Synced successfully.')
        })()
    } catch (err) {
        console.error('Unable to connect to the database:', err)
    }
    return app
}

export default server