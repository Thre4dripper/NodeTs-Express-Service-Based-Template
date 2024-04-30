const userRepository = require('../repositories/sequelize.user.repository');
const { ValidationError } = require('../../../handlers/CustomErrorHandler');
const EncryptionUtil = require('../../../utils/EncryptionUtil');

class UserService {
    async registerUser(data) {
        const user = await userRepository.find({ email: data.email });
        if (user) {
            throw new ValidationError('User already exists');
        }
        data.password = await EncryptionUtil.hashPassword(data.password);
        return userRepository.create(data);
    }

    async loginUser(data) {
        const user = await userRepository.find({ email: data.email });
        if (!user) {
            throw new ValidationError('User does not exist');
        }
        const isPasswordValid = await EncryptionUtil.comparePassword(
            data.password,
            user.password ?? ''
        );
        if (!isPasswordValid) {
            throw new ValidationError('Invalid password');
        }
        return user;
    }
}

module.exports = new UserService();
