import RequestBuilder, { PayloadType } from './RequestBuilder'
import { Request, RequestHandler, Response, Router } from 'express'
import asyncHandler from './AsyncHandler'
import SwaggerConfig, { SwaggerMethod } from '../../config/swaggerConfig'

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

class MasterController<P, Q, B> {
    private static joiErrors: IJoiErrors = {
        query: [],
        param: [],
        body: [],
    }

    public static doc(): ISwaggerDoc {
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

    private static joiValidator(params: any, query: any, body: any, validationRules: RequestBuilder): Boolean {
        if (validationRules.get.length === 0) {
            return true
        }

        this.joiErrors = {
            query: [],
            param: [],
            body: [],
        }

        validationRules.payload.forEach((payload) => {
            if (payload.type === PayloadType.PARAMS) {
                const schema = payload.schema
                const { error } = schema.validate(params, { abortEarly: false, allowUnknown: true })
                if (error) {
                    this.joiErrors.param?.push(...error.details.map((err) => err.message))
                }
            } else if (payload.type === PayloadType.QUERY) {
                const schema = payload.schema
                const { error } = schema.validate(query, { abortEarly: false, allowUnknown: true })
                if (error) {
                    this.joiErrors.query?.push(...error.details.map((err) => err.message))
                }
            } else if (payload.type === PayloadType.BODY) {
                const schema = payload.schema
                const { error } = schema.validate(body, { abortEarly: false, allowUnknown: true })
                if (error) {
                    this.joiErrors.body?.push(...error.details.map((err) => err.message))
                }
            }
        })

        if (this.joiErrors.query?.length === 0)
            delete this.joiErrors.query
        if (this.joiErrors.param?.length === 0)
            delete this.joiErrors.param
        if (this.joiErrors.body?.length === 0)
            delete this.joiErrors.body

        return !(this.joiErrors.query || this.joiErrors.param || this.joiErrors.body)
    }

    private static handler(): RequestHandler {
        const self = this
        return asyncHandler(async (req: Request, res: Response) => {
            const controller = new self()

            const allData = { ...req.params, ...req.query, ...req.body, ...req.headers, ...req }
            const validationRules = this.validate()
            const joiErrors = this.joiValidator(req.params, req.query, req.body, validationRules)

            if (!joiErrors) {
                return res.status(400).json({
                    status: 400,
                    message: 'Validation Error',
                    data: null,
                    errors: this.joiErrors,
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
}

export default MasterController