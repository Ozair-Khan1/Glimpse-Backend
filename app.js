const express = require('express')
const connectDB = require('./db/db')
const dotEnv = require('dotenv')
const authRoute = require('./routes/auth.route')
const postRoute = require('./routes/post.route')
const cookieParser = require('cookie-parser')
const cors = require('cors')

dotEnv.config()
connectDB()
const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)

module.exports = app