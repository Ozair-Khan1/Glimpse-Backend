const dotEnv = require('dotenv')

dotEnv.config()
const app = require('./app')
const connectDB = require('./db/db')


connectDB()
app.listen(process.env.PORT_NUM, () => {
    console.log('Server is running')
})

