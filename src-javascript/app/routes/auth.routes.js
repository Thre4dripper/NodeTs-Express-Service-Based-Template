const GetJwksController = require('../apis/auth/controllers/get.jwks.controller');

module.exports = (app) => {
    // Standard OAuth 2.0 / OpenID Connect JWKS discovery endpoint.
    GetJwksController.get(app, '/.well-known/jwks.json', []);
};
