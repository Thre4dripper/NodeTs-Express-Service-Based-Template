import MasterController from '../../../utils/MasterController'
import { ILoginUser } from '../interfaces'
import RequestBuilder from '../../../utils/RequestBuilder'
import Joi from 'joi'
import userService from '../services/user.service'
import ResponseBuilder from '../../../utils/ResponseBuilder'
import { StatusCodes } from '../../../enums/StatusCodes'

export default class LoginUserController extends MasterController<null, null, ILoginUser> {
    static doc() {
        return {
            tags: ['User'],
            summary: 'Login User',
            description: 'Login User',
        }
    }

    public static validate() {
        const payload = new RequestBuilder()

        payload.addToBody(
            Joi.object().keys({
                email: Joi.string().email().required(),
                password: Joi.string().min(8).max(20).required(),
            }),
        )

        return payload
    }

    async restController(params: null, query: null, body: ILoginUser, headers: any, allData: any): Promise<any> {
        const { email, password } = body

        const response = await userService.loginUser({ email, password })

        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User logged in successfully')
    }
}