const mongoose = require('mongoose')


const connectDB = async () => {
    await mongoose.connect('mongodb+srv://OzairKhan:ok3452697508A@glimpsedb.fjjt4hl.mongodb.net/DB')

    console.log('DB connected')
}

module.exports = connectDB