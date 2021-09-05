import express from 'express'
import Pillars from './index.js'
import defaultRouter from './example/http/routes/default.js'
import handlers from './example/http/handlers/index.js'
import pingMethods from './example/grpc/services/ping.js'

const {
  echo,
  testing,
  gotoHTTP,
  gotoGRPC
} = pingMethods

const HTTP_PORT = 8080
const GRPC_PORT = 8081

const main = async () => {
  const pillars = new Pillars({ PROTO_PATH: './example/grpc/protos/ping.proto' })

  const httpServer = pillars.httpServer
  httpServer.use(express.json())
  httpServer.use(handlers.unsupportedMediaType)
  httpServer.use(defaultRouter)
  httpServer.use(handlers.notFound)
  httpServer.use(handlers.error)
  httpServer.listen(HTTP_PORT, () => {
    pillars.logger.info(`HTTP Server listening at http://localhost:${HTTP_PORT}`)
  })
  const grpcServer = pillars.grpcServer
  grpcServer.use({ echo, testing, gotoHTTP, gotoGRPC })
  await grpcServer.start(`0.0.0.0:${GRPC_PORT}`)
  pillars.logger.info(`grpc Server listening at http://localhost:${GRPC_PORT}`)
}

main()
