import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { sequelize } from './sequelizeConfig'
import morgan from 'morgan'
import joiErrorHandler from '../app/handlers/JoiErrorHandler'
import customErrorHandler from '../app/handlers/CustomErrorHandler'
import * as fs from 'fs/promises'
import * as path from 'path'

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
        }),
    )
    const loadRouters = async (dir: string) => {
        //load all routers from dir and sub dir
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                //recursive call to sub dir
                await loadRouters(fullPath)
            } else if (entry.isFile() && (entry.name.endsWith('.router.ts') || entry.name.endsWith('.router.js'))) {
                const router = require(fullPath)
                router.default(app)
            }
        }
    }

    await loadRouters(path.join(__dirname, '../app/routes'))
    app.use(
        joiErrorHandler,
        customErrorHandler,
        (err: any, _req: Request, res: Response, _next: NextFunction) => {
            console.error(err) // Log the error for debugging
            return res.status(500).json({ error: 'Internal Server Error' }) // Respond with a 500 Internal Server Error
        },
    )

    // no route found
    app.use((_req: Request, res: Response) => {
        return res.status(404).json({ error: 'Route Not Found' })
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