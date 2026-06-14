import RegisterUserController from '../apis/user/controllers/register.user.controller';

/**
 * Demo socket module. Each `*.socket.ts` file self-registers its socket events
 * via `Controller.socketIO(event)`. Loaded by SocketConfig.InitSocketModules().
 */
RegisterUserController.socketIO('hello');
