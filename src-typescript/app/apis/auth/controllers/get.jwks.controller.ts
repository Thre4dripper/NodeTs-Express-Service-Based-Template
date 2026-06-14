import MasterController from '../../../utils/MasterController';
import ResponseBuilder from '../../../utils/ResponseBuilder';
import { StatusCodes } from '../../../enums/StatusCodes';
import EncryptionUtil from '../../../utils/EncryptionUtil';

/**
 * Publishes the service's RSA public key in JWKS form so other services can
 * verify RS256 tokens. Standard OAuth 2.0 / OIDC discovery path.
 */
export default class GetJwksController extends MasterController<null, null, null> {
    static doc() {
        return {
            tags: ['Auth'],
            summary: 'JWKS',
            description: 'Public keys (JWKS) for verifying RS256 JWTs',
        };
    }

    async restController(): Promise<ResponseBuilder> {
        const jwks = await EncryptionUtil.getPublicJwks();
        return new ResponseBuilder(StatusCodes.SUCCESS, jwks, 'JWKS retrieved successfully');
    }
}
