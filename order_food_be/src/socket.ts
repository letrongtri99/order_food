import express from 'express'
import * as http from 'http'

const app = express()
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}
const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: corsOptions
})

export default io


