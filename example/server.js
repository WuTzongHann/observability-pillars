import express from 'express'
import Pillars from '../index.js'
import defaultRouter from './http/routes/default.js'
import handlers from './http/handlers/index.js'
import pingMethods from './grpc/services/ping.js'

const {
  health,
  echo,
  gotoHTTP,
  gotoGRPC,
  errorTest,
  asyncTest
} = pingMethods

const HTTP_PORT = 8080
const GRPC_PORT = 8081

// NOTE: 分別做 HTTP 與 gRPC 的範例會比較好
const main = async () => {
  const pillars = new Pillars({ PROTO_PATH: './grpc/protos/ping.proto' })

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
  grpcServer.use({ health, echo, gotoHTTP, gotoGRPC, errorTest, asyncTest })
  await grpcServer.start(`0.0.0.0:${GRPC_PORT}`)
  pillars.logger.info(`grpc Server listening at http://localhost:${GRPC_PORT}`)
}

main()
