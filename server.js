const dotEnv = require('dotenv')

dotEnv.config()
const app = require('./app')
const connectDB = require('./db/db')


const startServer = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT_NUM, () => {
            console.log('Server is running and DB is ready');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer()