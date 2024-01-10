const User = require('../../../models/sequelize.user.model')

class UserRepository {
    async find(filter) {
        return User.findOne({
            where: filter,
        })
    }

    async create(data) {
        return User.create(data)
    }
}

module.exports = new UserRepository()
