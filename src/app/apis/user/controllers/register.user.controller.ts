import MasterController from '../../../utils/MasterController'
import { StatusCodes } from '../../../enums/StatusCodes'
import ResponseBuilder from '../../../utils/ResponseBuilder'
import RequestBuilder from '../../../utils/RequestBuilder'
import Joi from 'joi'
import userService from '../services/user.service'

class RegisterUserController extends MasterController<String, Number, Boolean> {
    static doc() {
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
                email: Joi.string().email().required(),
                password: Joi.string().min(8).max(20).required(),
            }),
        )

        return payload
    }

    async restController(params: String, query: Number, body: Boolean, headers: any, allData: any): Promise<any> {
        const { name, email, password } = allData

        const response = await userService.registerUser({ name, email, password })

        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User registered successfully')
    }
}

export default RegisterUserController