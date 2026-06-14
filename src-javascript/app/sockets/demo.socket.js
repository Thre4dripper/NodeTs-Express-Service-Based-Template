const RegisterUserController = require('../apis/user/controllers/register.user.controller');

/**
 * Demo socket module (JS mirror). Each `*.socket.js` file self-registers its
 * socket events via Controller.socketIO(event). Loaded by InitSocketModules().
 */
RegisterUserController.socketIO('hello');
