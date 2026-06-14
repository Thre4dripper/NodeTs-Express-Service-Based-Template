const { loadProto } = require('../../config/grpcConfig');
const RegisterUserController = require('../apis/user/controllers/register.user.controller');
const LoginUserController = require('../apis/user/controllers/login.user.controller');

/**
 * Demo User gRPC module (JS mirror of user.grpc.ts).
 *
 * Loads the service definition at runtime from proto/user/user.proto via
 * @grpc/proto-loader (no codegen). The single `.rpc()` facade works for all four
 * streaming kinds.
 */
module.exports = (server) => {
    const proto = loadProto('user/user.proto');
    const userService = proto.user.UserRpc.service;

    server.addService(userService, {
        register: RegisterUserController.rpc([]),
        login: LoginUserController.rpc([]),
    });
};
