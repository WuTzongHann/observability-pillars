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

// NOTE: package scope
// application server 通常不會同時監聽 gRPC 與 HTTP 作為應用
// 結果你的 package 目前的設計，卻會替 application server 加了一些它不需要的東西
// 須重新思考你的 package scope，思考如何提供足夠的需求，小心陷入「過早最佳化」的泥淖
class Pillars {
  constructor (userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions }
    const { PROTO_PATH } = options
    // NOTE: style not consistency
    // 為何 Metrics 與 Logger 是物件、traces 卻是 pure function？用法是否可以統一？
    // 還是你覺得有什麼是 package maintainer 需要特別注意的，所以用不同的風格呢？
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
    // NOTE: red flag: if PROTO_PATH is not given? what happen?
    const grpcServer = new Mali(PROTO_PATH)
    grpcServer.use(traces.grpcInterceptor(logger))
    grpcServer.use(metrics.grpcInterceptor())

    this.httpServer = httpServer
    this.grpcServer = grpcServer
    this.logger = logger
  }
}

export default Pillars
