const MasterController = require('../../../utils/MasterController');
const ResponseBuilder = require('../../../utils/ResponseBuilder');
const { StatusCodes } = require('../../../enums/StatusCodes');
const EncryptionUtil = require('../../../utils/EncryptionUtil');

/**
 * Publishes the service's RSA public key in JWKS form (JS mirror).
 */
class GetJwksController extends MasterController {
    static doc() {
        return {
            tags: ['Auth'],
            summary: 'JWKS',
            description: 'Public keys (JWKS) for verifying RS256 JWTs',
        };
    }

    async restController() {
        const jwks = await EncryptionUtil.getPublicJwks();
        return new ResponseBuilder(StatusCodes.SUCCESS, jwks, 'JWKS retrieved successfully');
    }
}

module.exports = GetJwksController;
