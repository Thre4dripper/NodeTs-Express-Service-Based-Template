import RegisterUserController from '../apis/user/controllers/register.user.controller';
import express from 'express';
import LoginUserController from '../apis/user/controllers/login.user.controller';

export default (app: express.Application) => {
    RegisterUserController.post(app, '/api/v1/user/register/', []);
    LoginUserController.post(app, '/api/v1/user/login/', []);
    RegisterUserController.socketIO('hello');
};
