import User from '../../../mongoose.models/mongoose.user.model'

class UserRepository {
    async find(filter: {}) {
        return User.findOne(filter).exec()
    }

    async create(data: any) {
        return User.create(data)
    }
}

export default new UserRepository()