import express from 'express'
import Mali from 'mali'
import morgan from 'morgan'
import defaultRouter from './http/routes/default.js'
import patientsRouter from './http/routes/patients.js'
import Metrics from './metrics/index.js'
import Logger from './logs/index.js'
import traces from './traces/index.js'
import handlers from './http/handlers/index.js'
import pingMethods from './grpc/services/ping.js'

const {
  echo,
  testing,
  gotoHTTP,
  gotoGRPC
} = pingMethods

const HTTP_PORT = 8080
const GRPC_PORT = 8081
const PROTO_PATH = './grpc/protos/ping.proto'

const main = async () => {
  const metrics = new Metrics()
  const logger = new Logger()

  const httpServer = express()
  httpServer.use(traces.httpMiddleware(logger))
  httpServer.use(metrics.httpMiddleware())
  httpServer.use(morgan(function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      'content-length': tokens.res(req, res, 'content-length'),
      'response-time': tokens['response-time'](req, res)
    })
  }, { stream: logger.stream }))
  httpServer.use(express.json())
  httpServer.use(handlers.unsupportedMediaType)
  httpServer.use(defaultRouter)
  httpServer.use('/patients', patientsRouter)
  httpServer.use(handlers.notFound)
  httpServer.use(handlers.error)
  httpServer.listen(HTTP_PORT, () => {
    logger.info(`HTTP Server listening at http://localhost:${HTTP_PORT}`)
  })

  const gRPCServer = new Mali(PROTO_PATH)
  gRPCServer.use(traces.grpcInterceptor(logger))
  gRPCServer.use(metrics.grpcInterceptor())
  gRPCServer.use({ echo, testing, gotoHTTP, gotoGRPC })
  await gRPCServer.start(`0.0.0.0:${GRPC_PORT}`)
  logger.info(`gRPC Server listening at http://localhost:${GRPC_PORT}`)
}

main()
