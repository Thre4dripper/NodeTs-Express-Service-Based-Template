import User from '../../../sequelize.models/sequelize.user.model'

class UserRepository {
    async find(filter: {}) {
        return User.findOne({
            where: filter,
        })
    }

    async create(data: any) {
        return User.create(data)
    }
}

export default new UserRepository();