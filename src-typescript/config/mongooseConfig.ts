import mongoose, { ConnectOptions } from 'mongoose';
import * as process from 'process';

require('dotenv').config();
const mongooseOptions: ConnectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

export const mongooseConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!, mongooseOptions);
        console.log('\x1b[32m%s\x1b[0m', 'Database Connected successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        throw err;
    }
};
