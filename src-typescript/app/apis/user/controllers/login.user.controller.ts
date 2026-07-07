import MasterController from '../../../utils/MasterController';
import RequestBuilder from '../../../utils/RequestBuilder';
import Joi from 'joi';
// start grpc
import * as grpc from '@grpc/grpc-js';
// end grpc
import { ILoginUser } from '../interfaces';
import userService from '../services/user.service';
import ResponseBuilder from '../../../utils/ResponseBuilder';
import { StatusCodes } from '../../../enums/StatusCodes';
// start grpc
// Generated from proto/user/user.proto via `pnpm proto:build` (gitignored, regenerated on postinstall).
import { LoginUserResponse } from '@proto/generated/user/user';
// end grpc

export default class LoginUserController extends MasterController<any, any, ILoginUser> {
    static doc() {
        return {
            tags: ['User'],
            summary: 'Login User',
            description: 'Login User',
        };
    }

    public static validate() {
        const payload = new RequestBuilder();

        const schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(20).required(),
        });

        payload.addToBody(schema);
        // start grpc
        payload.addToGrpcPayload(schema);
        // end grpc

        return payload;
    }

    async restController(
        params: null,
        query: null,
        body: ILoginUser,
        headers: any,
        allData: any
    ): Promise<ResponseBuilder> {
        const { email, password } = body;

        const response = await userService.loginUser({ email, password });

        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User logged in successfully');
    }

    // start grpc
    async grpcController(request: ILoginUser, _metadata: grpc.Metadata): Promise<ResponseBuilder> {
        const { email, password } = request;

        const user = await userService.loginUser({ email, password });

        const grpcResponse: LoginUserResponse = {
            user: {
                id: String((user as any).id ?? (user as any)._id ?? ''),
                name: (user as any).name ?? '',
                email,
            },
            message: 'ok',
        };
        const response = new ResponseBuilder(
            StatusCodes.SUCCESS,
            grpcResponse,
            'User logged in successfully'
        );
        return response;
    }
    // end grpc
}
