const RegisterUserController = require('../apis/user/controllers/register.user.controller')
const LoginUserController = require('../apis/user/controllers/login.user.controller')

module.exports = (app) => {
    RegisterUserController.post(app, '/api/v1/user/register/', [])
    LoginUserController.post(app, '/api/v1/user/login/', [])
    RegisterUserController.socketIO('hello')
}