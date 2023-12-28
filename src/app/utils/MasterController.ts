import RequestBuilder, { PayloadType } from './RequestBuilder'
import { Request, RequestHandler, Response, Router } from 'express'
import asyncHandler from './AsyncHandler'
import SwaggerConfig, { SwaggerMethod } from '../../config/swaggerConfig'
import { Server, Socket } from 'socket.io'

interface IJoiErrors {
    query?: string[]
    param?: string[]
    body?: string[]
}

interface ISwaggerDoc {
    tags: string[]
    summary: string
    description: string
}

interface ISocketClient {
    event: string
    masterController: MasterController<any, any, any>
}

class MasterController<P, Q, B> {
    private static requests: ISocketClient[] = []

    static getRequests(): ISocketClient[] {
        return this.requests
    }

    static doc(): ISwaggerDoc {
        return {
            tags: [],
            summary: '',
            description: '',
        }
    }

    public static validate(): RequestBuilder {
        return new RequestBuilder()
    }

    protected async restController(params: P, query: Q, body: B, headers: any, allData: any): Promise<any> {
    }

    protected socketController(io: Server, socket: Socket, payload: any): any {
    }

    private static joiValidator(params: any, query: any, body: any, validationRules: RequestBuilder): IJoiErrors | null {
        if (validationRules.get.length === 0) {
            return null
        }

        const joiErrors: IJoiErrors = {
            query: [],
            param: [],
            body: [],
        }

        validationRules.payload.forEach((payload) => {
            if (payload.type === PayloadType.PARAMS) {
                const schema = payload.schema
                const { error } = schema.validate(params, { abortEarly: false, allowUnknown: true })
                if (error) {
                    joiErrors.param?.push(...error.details.map((err) => err.message))
                }
            } else if (payload.type === PayloadType.QUERY) {
                const schema = payload.schema
                const { error } = schema.validate(query, { abortEarly: false, allowUnknown: true })
                if (error) {
                    joiErrors.query?.push(...error.details.map((err) => err.message))
                }
            } else if (payload.type === PayloadType.BODY) {
                const schema = payload.schema
                const { error } = schema.validate(body, { abortEarly: false, allowUnknown: true })
                if (error) {
                    joiErrors.body?.push(...error.details.map((err) => err.message))
                }
            }
        })

        //remove empty arrays
        if (joiErrors.query?.length === 0)
            delete joiErrors.query
        if (joiErrors.param?.length === 0)
            delete joiErrors.param
        if (joiErrors.body?.length === 0)
            delete joiErrors.body

        //return null if no errors, i.e. all arrays are removed above
        if (Object.keys(joiErrors).length === 0)
            return null

        return joiErrors
    }

    private static handler(): RequestHandler {
        const self = this
        return asyncHandler(async (req: Request, res: Response) => {
            const controller = new self()

            const allData = { ...req.params, ...req.query, ...req.body, ...req.headers, ...req }
            const validationRules = this.validate()
            const joiErrors = this.joiValidator(req.params, req.query, req.body, validationRules)

            if (joiErrors) {
                return res.status(400).json({
                    status: 400,
                    message: 'Validation Error',
                    data: null,
                    errors: joiErrors,
                })
            }
            const { response } = await controller.restController(req.params, req.query, req.body, req.headers, allData)
            res.status(response.status).json(response)
        })
    }

    /**
     * @description This method is used to register a GET route for the controller class
     * @param router router object
     * @param path path for the route
     * @param middlewares middlewares for the route
     */
    static get(router: Router, path: string, middlewares: RequestHandler[]) {
        SwaggerConfig.recordApi(path, SwaggerMethod.GET, this)
        return router.get(path, middlewares, this.handler())
    }

    /**
     * @description This method is used to register a POST route for the controller class
     * @param router router object
     * @param path path for the route
     * @param middlewares middlewares for the route
     */
    static post(router: Router, path: string, middlewares: RequestHandler[]) {
        SwaggerConfig.recordApi(path, SwaggerMethod.POST, this)
        return router.post(path, middlewares, this.handler())
    }

    /**
     * @description This method is used to register a PUT route for the controller class
     * @param router router object
     * @param path path for the route
     * @param middlewares middlewares for the route
     */
    static put(router: Router, path: string, middlewares: RequestHandler[]) {
        SwaggerConfig.recordApi(path, SwaggerMethod.PUT, this)
        return router.put(path, middlewares, this.handler())
    }

    /**
     * @description This method is used to register a DELETE route for the controller class
     * @param router router object
     * @param path path for the route
     * @param middlewares middlewares for the route
     */
    static delete(router: Router, path: string, middlewares: RequestHandler[]) {
        SwaggerConfig.recordApi(path, SwaggerMethod.DELETE, this)
        return router.delete(path, middlewares, this.handler())
    }

    static socketIO(event: string) {
        this.requests.push({ event, masterController: new this() })
    }
}

export default MasterController