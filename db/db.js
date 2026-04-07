const dotEnv = require('dotenv')
dotEnv.config()
const mongoose = require('mongoose')


const connectDB = async () => {

    try {
        console.log('connecting to db')
        await mongoose.connect(process.env.MONGO_URI)
        console.log('db connected')
    } catch (error) {
        console.log(error)
    }

}

module.exports = connectDB