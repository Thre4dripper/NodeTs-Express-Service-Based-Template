import ResponseBuilder from './ResponseBuilder'
import RequestBuilder from './RequestBuilder'
import { RequestHandler, Router } from 'express'

abstract class MasterController<P, Q, B> {
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
        return async (req, res) => {

            return res.status(200).json({
                status: 200,
                message: 'success',
                data: {},
            })
        }
    }

    static get(router: Router, path: string, middlewares: RequestHandler[]) {
        return router.get(path, middlewares, this.handler())
    }
}

export default MasterController