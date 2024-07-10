const MasterController = require('../../../utils/MasterController');
const { default: RequestBuilder } = require('../../../utils/RequestBuilder');
const Joi = require('joi');
const userService = require('../services/user.service');
const ResponseBuilder = require('../../../utils/ResponseBuilder');
const { StatusCodes } = require('../../../enums/StatusCodes');

class LoginUserController extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            summary: 'Login User',
            description: 'Login User',
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                email: Joi.string().email().required(),
                password: Joi.string().min(8).max(20).required(),
            })
        );
        return payload;
    }

    async restController(params, query, body, headers, allData) {
        const { email, password } = body;
        const response = await userService.loginUser({ email, password });
        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User logged in successfully');
    }
}

module.exports = LoginUserController;
