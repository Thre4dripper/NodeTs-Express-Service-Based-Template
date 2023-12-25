import RequestBuilder, { payloadType } from './RequestBuilder'
import { RequestHandler, Router } from 'express'
import asyncHandler from './AsyncHandler'

class MasterController<P, Q, B> {
    params: P
    query: Q
    body: B
    headers: any
    req: any
    res: any
    allData: any
    static joiErrors: { query?: string[], param?: string[], body?: string[] } = {
        query: [],
        param: [],
        body: [],
    }

    protected static doc(): any {
    }

    protected static validate(): RequestBuilder {
        return new RequestBuilder()
    }

    protected async restController(params: P, query: Q, body: B, headers: any, allData: any): Promise<any> {
    }

    private static joiValidator(data: any, validationRules: RequestBuilder): Boolean {
        if (validationRules.get.length === 0) {
            return true
        }

        this.joiErrors = {
            query: [],
            param: [],
            body: [],
        }

        validationRules.payload.forEach((payload) => {
            if (payload.type === payloadType.PARAMS) {
                const schema = payload.schema
                const { error } = schema.validate(data, { abortEarly: false, allowUnknown: true })
                if (error) {
                    this.joiErrors.query?.push(...error.details.map((err) => err.message))
                }
            } else if (payload.type === payloadType.QUERY) {
                const schema = payload.schema
                const { error } = schema.validate(data, { abortEarly: false, allowUnknown: true })
                if (error) {
                    this.joiErrors.param?.push(...error.details.map((err) => err.message))
                }
            } else if (payload.type === payloadType.BODY) {
                const schema = payload.schema
                const { error } = schema.validate(data, { abortEarly: false, allowUnknown: true })
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
        return asyncHandler(async (req: any, res: any) => {
            const controller = new self()
            controller.req = req
            controller.res = res
            controller.params = req.params
            controller.query = req.query
            controller.body = req.body
            controller.headers = req.headers
            controller.allData = { ...req.params, ...req.query, ...req.body, ...req.headers }
            const validationRules = this.validate()
            const joiErrors = this.joiValidator(req.params, validationRules)

            if (!joiErrors) {
                return res.status(400).json({
                    status: 400,
                    message: 'Validation Error',
                    data: null,
                    errors: this.joiErrors,
                })
            }
            const { response } = await controller.restController(req.params, req.query, req.body, req.headers, controller.allData)
            res.status(response.status).json(response)
        })
    }

    static get(router: Router, path: string, middlewares: RequestHandler[]) {
        return router.get(path, middlewares, this.handler())
    }

    static post(router: Router, path: string, middlewares: RequestHandler[]) {
        return router.post(path, middlewares, this.handler())
    }

    static put(router: Router, path: string, middlewares: RequestHandler[]) {
        return router.put(path, middlewares, this.handler())
    }

    static delete(router: Router, path: string, middlewares: RequestHandler[]) {
        return router.delete(path, middlewares, this.handler())
    }

    static patch(router: Router, path: string, middlewares: RequestHandler[]) {
        return router.patch(path, middlewares, this.handler())
    }
}

export default MasterController