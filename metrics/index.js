import express from 'express'
import prometheus from 'prom-client'
import httpMetricsMiddleware from './httpMetrics.js'
import grpcMetricsInterceptor from './grpcMetrics.js'
import { jsonLogger } from '../logs/index.js'

const defaultOptions = {
  METRICS_PORT: 9090,
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  httpMetricsMiddleware,
  grpcMetricsInterceptor
}

// workaround solution for silence reject
// ref: https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
const asyncHandler = fn => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next)
}

class Metrics {
  constructor (userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions }
    const app = express()
    app.get(options.metricsPath, asyncHandler(async (req, res, next) => {
      res.set('Content-Type', prometheus.register.contentType)
      res.send(await prometheus.register.metrics())
      const { originalUrl: urlPath, method } = req
      jsonLogger.info('User Visited', { exportToPrometheus: false, urlPath, method, statusCode: res.statusCode })
    }))
    app.listen(options.METRICS_PORT, () => {
      jsonLogger.info(`Metrics Server listening at http://localhost:${options.METRICS_PORT}`)
    })
    if (options.collectDefaultMetrics === true) {
      prometheus.collectDefaultMetrics()
    }
    this.httpMetricsMiddleware = options.httpMetricsMiddleware
    this.grpcMetricsInterceptor = options.grpcMetricsInterceptor
  }

  get httpMiddleware () {
    return this.httpMetricsMiddleware
  }

  get grpcInterceptor () {
    return this.grpcMetricsInterceptor
  }
}

export default Metrics
export { httpMetricsMiddleware, grpcMetricsInterceptor }
