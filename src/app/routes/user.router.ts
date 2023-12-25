import RegisterUserController from '../apis/user/controllers/register.user.controller'
import express from 'express'

export default (app: express.Application) => {
    RegisterUserController.get(app, '/api/v1/user/register', [])
}