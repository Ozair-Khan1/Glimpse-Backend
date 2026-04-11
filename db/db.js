const dotEnv = require('dotenv')
dotEnv.config()
const mongoose = require('mongoose')


let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        console.log('Connecting to db...');
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log('DB connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
    }
};

module.exports = connectDB