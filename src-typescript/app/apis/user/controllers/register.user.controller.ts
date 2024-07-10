import MasterController from '../../../utils/MasterController';
import { StatusCodes } from '../../../enums/StatusCodes';
import ResponseBuilder from '../../../utils/ResponseBuilder';
import RequestBuilder from '../../../utils/RequestBuilder';
import Joi from 'joi';
import userService from '../services/user.service';
import { IRegisterUser } from '../interfaces';

export default class RegisterUserController extends MasterController<null, null, IRegisterUser> {
    static doc() {
        return {
            tags: ['User'],
            summary: 'Register User',
            description: 'Register User',
        };
    }

    public static validate(): RequestBuilder {
        const payload = new RequestBuilder();

        payload.addToBody(
            Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).max(20).required(),
            })
        );

        return payload;
    }

    async restController(
        params: null,
        query: null,
        body: IRegisterUser,
        headers: any,
        allData: any
    ): Promise<ResponseBuilder> {
        const { name, email, password } = body;

        const response = await userService.registerUser({ name, email, password });

        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User registered successfully');
    }
}
