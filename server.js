const dotEnv = require('dotenv')

dotEnv.config()
const app = require('./app')
const croneJob = require('./services/crone')

const startServer = async () => {
    try {
        croneJob()

        if (process.env.NODE_ENV !== 'production') {
            app.listen(process.env.PORT_NUM, () => {
                console.log(`Server running locally on port ${process.env.PORT_NUM}`)
            })
        }
    } catch (error) {
        console.error('Server Start Error:', error)
    }
}

startServer()

module.exports = app