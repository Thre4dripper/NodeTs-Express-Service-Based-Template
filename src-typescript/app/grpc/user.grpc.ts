import * as grpc from '@grpc/grpc-js';
import { loadProto } from '../../config/grpcConfig';
import RegisterUserController from '../apis/user/controllers/register.user.controller';
import LoginUserController from '../apis/user/controllers/login.user.controller';

/**
 * Demo User gRPC module — the gRPC mirror of the REST user demo.
 *
 * The service definition is loaded at runtime from `proto/user/user.proto` so the
 * template boots without a codegen step. For type-safe stubs, run `pnpm proto:build`
 * and import the generated `UserRpcService` from `@proto/generated/user/user` instead.
 *
 * Note the single `.rpc()` facade: the same controller method works whether the
 * proto method is unary, server-, client-, or bidi-streaming.
 */
export default (server: grpc.Server) => {
    const proto = loadProto('user/user.proto') as any;
    const userService = proto.user.UserRpc.service;

    server.addService(userService, {
        register: RegisterUserController.rpc([]),
        login: LoginUserController.rpc([]),
    });
};
