import MasterController from '../../../utils/MasterController'
import { StatusCodes } from '../../../enums/StatusCodes'
import ResponseBuilder from '../../../utils/ResponseBuilder'

class RegisterUserController extends MasterController<String, Number, Boolean> {
    protected async restController(params: String, query: Number, body: Boolean, headers: any, allData: any): Promise<any> {
        return new ResponseBuilder(StatusCodes.SUCCESS, 'Success', 'AEgagaeg')
    }
}

export default RegisterUserController