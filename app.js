const express = require('express')
const dotEnv = require('dotenv')
const authRoute = require('./routes/auth.route')
const postRoute = require('./routes/post.route')
const storyRoute = require('./routes/story.route')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const dbMiddleware = require('./utils/dbMiddleware')

dotEnv.config()
const app = express()
app.set("trust proxy", 1);
app.use(dbMiddleware)
app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: 'https://glimpse-pearl.vercel.app',
    credentials: true
}))

app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)
app.use('/api/story', storyRoute)

module.exports = app