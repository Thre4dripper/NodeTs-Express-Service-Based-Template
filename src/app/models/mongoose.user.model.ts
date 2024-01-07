import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    //add more fields
}, {
    timestamps: true,
})

const User = mongoose.model('User', UserSchema)

export default User