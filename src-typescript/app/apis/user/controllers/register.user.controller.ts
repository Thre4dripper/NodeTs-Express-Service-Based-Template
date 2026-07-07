// start grpc
/**
 * CALLING A REMOTE gRPC SERVICE — example pattern (not wired by default).
 *
 * When this service needs to call another gRPC service (e.g. a remote profile
 * service), use the generic factory from `app/common/grpc.client.ts`:
 *
 *   import getRpcClient from '../../common/grpc.client';
 *   import { GrpcClientFactory } from '../../../utils/GrpcClientFactory';
 *   // ProfileRpcClient is generated from proto stubs via `pnpm proto:build`
 *   import { ProfileRpcClient } from '../../../../proto/generated/profile/profile';
 *
 *   // Env: REMOTE_SERVICE_GRPC_ADDRESS=profile-service:50051
 *   const client = getRpcClient('profileService', ProfileRpcClient, 'REMOTE_SERVICE_GRPC_ADDRESS');
 *   const profile = await GrpcClientFactory.unary(client, 'getProfile', { userId: user.id });
 */
// end grpc
import MasterController from '../../../utils/MasterController';
import { StatusCodes } from '../../../enums/StatusCodes';
import ResponseBuilder from '../../../utils/ResponseBuilder';
import RequestBuilder from '../../../utils/RequestBuilder';
import Joi from 'joi';
// start grpc
import * as grpc from '@grpc/grpc-js';
// end grpc
import userService from '../services/user.service';
import { IRegisterUser } from '../interfaces';
// start grpc
// Generated from proto/user/user.proto via `pnpm proto:build` (gitignored, regenerated on postinstall).
import { RegisterUserResponse } from '@proto/generated/user/user';
// end grpc

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

        const schema = Joi.object().keys({
            name: Joi.string().required(),
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
        body: IRegisterUser,
        headers: any,
        allData: any
    ): Promise<ResponseBuilder> {
        const { name, email, password } = body;

        const response = await userService.registerUser({ name, email, password });

        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User registered successfully');
    }

    // start grpc
    async grpcController(
        request: IRegisterUser,
        _metadata: grpc.Metadata
    ): Promise<ResponseBuilder> {
        const { name, email, password } = request;

        const user = await userService.registerUser({ name, email, password });

        const grpcResponse: RegisterUserResponse = {
            user: { id: String((user as any).id ?? (user as any)._id ?? ''), name, email },
            message: 'ok',
        };
        const response = new ResponseBuilder(
            StatusCodes.SUCCESS,
            grpcResponse,
            'User registered successfully'
        );
        return response;
    }
    // end grpc
}
