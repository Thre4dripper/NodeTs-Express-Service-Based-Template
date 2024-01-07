import { Column, DataType, Model, Table } from 'sequelize-typescript'

@Table
export default class User extends Model<User> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    email: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    phone: string

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    address: string

    //add more fields
}