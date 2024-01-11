const mongoose = require('mongoose')

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
module.exports = mongoose.model('User', UserSchema)
