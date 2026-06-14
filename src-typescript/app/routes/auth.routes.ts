import express from 'express';
import GetJwksController from '../apis/auth/controllers/get.jwks.controller';

export default (app: express.Application) => {
    // Standard OAuth 2.0 / OpenID Connect JWKS discovery endpoint.
    GetJwksController.get(app, '/.well-known/jwks.json', []);
};
