import express from 'express'
import Mali from 'mali'
import morgan from 'morgan'
import Metrics from './metrics/index.js'
import Logger from './logs/index.js'
import traces from './traces/index.js'

const defaultOptions = {
  PROTO_PATH: './example/grpc/protos/ping.proto'
}

morgan.token('trace_id', (req, res) => res.locals.logger.trace_id)
morgan.token('span_id', (req, res) => res.locals.logger.span_id)

class Pillars {
  constructor (userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions }
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
        statusCode: tokens.status(req, res),
        urlPath: tokens.url(req, res)
      })
    }, { stream: logger.stream }))

    console.log(options.PROTO_PATH)
    const grpcServer = new Mali(options.PROTO_PATH)
    grpcServer.use(traces.grpcInterceptor(logger))
    grpcServer.use(metrics.grpcInterceptor())

    this.httpServer = httpServer
    this.grpcServer = grpcServer
    this.logger = logger
  }
}

export default Pillars
