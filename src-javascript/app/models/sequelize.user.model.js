const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelizeConfig'); // Assuming sequelize connection is established and exported

const User = sequelize.define(
    'User',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // add more fields as needed
    },
    {
        timestamps: true,
        // Other configurations if required
    }
);

module.exports = User;
