import { IRegisterUser } from '../interfaces'
import userRepository from '../repositories/user.repository'
import { ValidationError } from '../../../handlers/CustomErrorHandler'

class UserService {
    async registerUser(data: IRegisterUser) {
        const user = await userRepository.find({ email: data.email })

        if (user) {
            throw new ValidationError('User already exists')
        }

        return userRepository.create(data)
    }
}

export default new UserService()