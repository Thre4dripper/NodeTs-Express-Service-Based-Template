import MasterController from '../../../utils/MasterController'
import { StatusCodes } from '../../../enums/StatusCodes'
import ResponseBuilder from '../../../utils/ResponseBuilder'
import RequestBuilder from '../../../utils/RequestBuilder'
import Joi from 'joi'

class RegisterUserController extends MasterController<String, Number, Boolean> {
    static doc(): { tags: string[], summary: string, description: string } {
        return {
            tags: ['User'],
            summary: 'Register User',
            description: 'Register User',
        }
    }

    public static validate(): RequestBuilder {
        const payload = new RequestBuilder()

        payload.addToBody(
            Joi.object().keys({
                name: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).max(20).required(),
            }),
        )

        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.number().required(),
                offset: Joi.number().required(),
            }),
        )

        payload.addToParams(
            Joi.object().keys({
                id: Joi.number().required(),
            }),
        )
        return payload
    }

    protected async restController(params: String, query: Number, body: Boolean, headers: any, allData: any): Promise<any> {
        return new ResponseBuilder(StatusCodes.SUCCESS, 'Success', 'AEgagaeg')
    }
}

export default RegisterUserController