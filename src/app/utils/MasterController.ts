import ResponseBuilder from './ResponseBuilder'
import RequestBuilder from './RequestBuilder'
import { RequestHandler, Router } from 'express'

class MasterController<P, Q, B> {
    params: P
    query: Q
    body: B
    headers: any
    req: any
    res: any
    allData: any
    ResponseBuilder: typeof ResponseBuilder
    validate: RequestBuilder

    protected static doc(): any {
    }

    protected static validate(): RequestBuilder {
        return new RequestBuilder()
    }

    protected async restController(params: P, query: Q, body: B, headers: any, allData: any): Promise<any> {
    }

    private static handler(): RequestHandler {
        const self = this
        return async (req: any, res: any) => {
            const controller = new self()
            controller.req = req
            controller.res = res
            controller.params = req.params
            controller.query = req.query
            controller.body = req.body
            controller.headers = req.headers
            controller.allData = { ...req.params, ...req.query, ...req.body, ...req.headers }
            controller.validate = this.validate()
            const { response } = await controller.restController(req.params, req.query, req.body, req.headers, controller.allData)
            res.status(response.status).json(response)
        }
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