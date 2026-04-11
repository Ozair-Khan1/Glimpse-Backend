const dotEnv = require('dotenv')

dotEnv.config()
const app = require('./app')
const connectDB = require('./db/db')
const croneJob = require('./services/crone')

const startServer = async () => {

    try {
        await connectDB()


        croneJob()
        app.listen(process.env.PORT_NUM, () => {
            console.log('Server and Db connected')
        })
    } catch (error) {
        console.log(error)
    }

}
startServer()

module.exports = app