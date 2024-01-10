const MasterController = require('../../../utils/MasterController')
const { StatusCodes } = require('../../../enums/StatusCodes')
const ResponseBuilder = require('../../../utils/ResponseBuilder')
const { default: RequestBuilder } = require('../../../utils/RequestBuilder')
const Joi = require('joi')
const userService = require('../services/user.service')

class RegisterUserController extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            summary: 'Register User',
            description: 'Register User',
        }
    }

    static validate() {
        const payload = new RequestBuilder()
        payload.addToBody(Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(20).required(),
        }))
        return payload
    }

    async restController(params, query, body, headers, allData) {
        const { name, email, password } = body
        const response = await userService.registerUser({ name, email, password })
        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User registered successfully')
    }
}

module.exports = RegisterUserController