const mongoose = require('mongoose');
const process = require('process');
require('dotenv').config();

const mongooseOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    ssl: true,
};

const mongooseConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
        console.log('\x1b[32m%s\x1b[0m', 'Database Connected successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        throw err;
    }
};

exports.mongooseConnect = mongooseConnect;
