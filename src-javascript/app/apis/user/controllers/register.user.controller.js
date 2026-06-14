/**
 * CALLING A REMOTE gRPC SERVICE — example pattern (not wired by default).
 *
 * When this service needs to call another gRPC service (e.g. a remote profile
 * service), use the generic factory from `app/common/grpc.client.js`:
 *
 *   const getRpcClient = require('../../common/grpc.client');
 *   const GrpcClientFactory = require('../../../utils/GrpcClientFactory');
 *   // ProfileRpcClient is generated from proto stubs via `pnpm proto:build`
 *   const { ProfileRpcClient } = require('../../../../proto/generated/profile/profile');
 *
 *   // Env: REMOTE_SERVICE_GRPC_ADDRESS=profile-service:50051
 *   const client = getRpcClient('profileService', ProfileRpcClient, 'REMOTE_SERVICE_GRPC_ADDRESS');
 *   const profile = await GrpcClientFactory.unary(client, 'getProfile', { userId: user.id });
 */
const MasterController = require('../../../utils/MasterController');
const { StatusCodes } = require('../../../enums/StatusCodes');
const ResponseBuilder = require('../../../utils/ResponseBuilder');
const { default: RequestBuilder } = require('../../../utils/RequestBuilder');
const Joi = require('joi');
const userService = require('../services/user.service');

class RegisterUserController extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            summary: 'Register User',
            description: 'Register User',
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(20).required(),
        });
        payload.addToBody(schema);
        payload.addToGrpcPayload(schema);
        return payload;
    }

    async restController(params, query, body, headers, allData) {
        const { name, email, password } = body;
        const response = await userService.registerUser({ name, email, password });
        return new ResponseBuilder(StatusCodes.SUCCESS, response, 'User registered successfully');
    }

    async grpcController(request) {
        const { name, email, password } = request;
        const user = await userService.registerUser({ name, email, password });
        const response = new ResponseBuilder(
            StatusCodes.SUCCESS,
            { user: { id: String(user.id || user._id || ''), name, email }, message: 'ok' },
            'User registered successfully'
        );
        return response;
    }
}

module.exports = RegisterUserController;
