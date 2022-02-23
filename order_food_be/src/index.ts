import { createAccessToken, createRefreshToken } from './utils/auth'
import 'dotenv-safe/config'
import 'reflect-metadata'
import { verify } from 'jsonwebtoken'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { graphqlUploadExpress } from 'graphql-upload'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import path from 'path'
import redis from 'redis'
// import Redis from "ioredis";
// import session from 'express-session'
// import connectRedis from 'connect-redis'
import { __prod__ } from './constants'
import cors from 'cors'
import { ENTITES } from './entities'
import { RESOLVERS } from './resolvers'
import { Customer } from './entities/Customer'
import cookieParser from 'cookie-parser'
import { Delivery } from './entities/Delivery'
import { Store } from './entities/Store'
import job from './cronjob'
import * as http from 'http'
import io from './socket'

const main = async () => {
  await createConnection({
    entities: ENTITES,
    type: 'mysql',
    url: process.env.DATABASE_URL,
    logging: false,
    timezone: 'Z',
    synchronize: true, // turn off when in prod (gan giong migrations)
    migrations: [path.join(__dirname, './migrations/*')]
  })

  const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
  // await conn.runMigrations();

  const app = express()
  const server = http.createServer(app)
  io.attach(server)
  // const io = require('socket.io')(server, {
  //   cors: corsOptions
  // })

  // io.on('connection', (socket: socketio.Socket) => {
  //   // console.log('Socket connected')
  //   // socket.emit("hello", "world");
  // })

  app.use(cookieParser())
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))

  app.use(express.static('dist'))

  app.use(cors(corsOptions))
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid
    if (!token) {
      return res.send({ status: false, accessToken: '' })
    }
    let payload: any = null

    try {
      payload = verify(token, process.env.TOKEN_SECRET)
    } catch (e) {
      console.log(e)
      return res.send({ status: false, accessToken: '' })
    }

    const user =
      payload.role === 'customer'
        ? await Customer.findOne({ id: payload.id })
        : payload.role === 'delivery'
          ? await Delivery.findOne({ id: payload.id })
          : await Store.findOne({ id: payload.id })
    if (!user) {
      return res.send({ status: false, accessToken: '' })
    }

    res.cookie('jid', createRefreshToken(user, payload.role), {
      httpOnly: true
    })
    return res.send({
      status: true,
      accessToken: createAccessToken(user, payload.role),
      role: payload.role
    })
  })

  const apolloServer = new ApolloServer({
    uploads: false,
    schema: await buildSchema({
      resolvers: RESOLVERS,
      validate: false
    }),
    context: ({ req, res }) => ({ req, res, redis })
  })

  apolloServer.applyMiddleware({
    app,
    cors: corsOptions
  })

  // Cronjob
  job.start()

  server.listen(parseInt(process.env.PORT), () => {
    console.log('Server started on localhost:4000')
  })
}

main().catch((err) => {
  console.error(err)
})
