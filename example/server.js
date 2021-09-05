import express from 'express'
import Mali from 'mali'
import morgan from 'morgan'
import defaultRouter from './http/routes/default.js'
import Metrics from '../metrics/index.js'
import Logger from '../logs/index.js'
import traces from '../traces/index.js'
import handlers from './http/handlers/index.js'
import pingMethods from './grpc/services/ping.js'

morgan.token('trace_id', (req, res) => res.locals.logger.trace_id)
morgan.token('span_id', (req, res) => res.locals.logger.span_id)

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
  httpServer.use(morgan((tokens, req, res) => {
    return JSON.stringify({
      trace_id: tokens.trace_id(req, res),
      span_id: tokens.span_id(req, res),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res)
    })
  }, { stream: logger.stream }))
  httpServer.use(express.json())
  httpServer.use(handlers.unsupportedMediaType)
  httpServer.use(defaultRouter)
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
