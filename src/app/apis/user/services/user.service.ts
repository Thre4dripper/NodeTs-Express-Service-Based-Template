import { ILoginUser, IRegisterUser } from '../interfaces'
import userRepository from '../repositories/user.repository'
import { ValidationError } from '../../../handlers/CustomErrorHandler'
import EncryptionUtil from '../../../utils/EncryptionUtil'

class UserService {
    async registerUser(data: IRegisterUser) {
        const user = await userRepository.find({ email: data.email })

        if (user) {
            throw new ValidationError('User already exists')
        }

        data.password = await EncryptionUtil.hashPassword(data.password)

        return userRepository.create(data)
    }

    async loginUser(data: ILoginUser) {
        const user = await userRepository.find({ email: data.email })

        if (!user) {
            throw new ValidationError('User does not exist')
        }

        const isPasswordValid = await EncryptionUtil.comparePassword(data.password, user.password)

        if (!isPasswordValid) {
            throw new ValidationError('Invalid password')
        }

        return user
    }
}

export default new UserService()