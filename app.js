const express = require('express')
const dotEnv = require('dotenv')
const authRoute = require('./routes/auth.route')
const postRoute = require('./routes/post.route')
const cookieParser = require('cookie-parser')
const cors = require('cors')

dotEnv.config()
const app = express()
app.set("trust proxy", 1);
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: 'https://glimpse-pearl.vercel.app',
    credentials: true
}))

app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)

module.exports = app