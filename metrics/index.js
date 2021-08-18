import express from 'express'
import prometheus from 'prom-client'
import httpMetricsMiddleware from './httpMetrics.js'
import grpcMetricsInterceptor from './grpcMetrics.js'

const defaultOptions = {
  metricsPath: '/metrics',
  collectDefaultMetrics: true
}

// workaround solution for silence reject
// ref: https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
const asyncHandler = fn => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next)
}

class MetricsServer {
  constructor
  (userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions }
    const app = express()
    app.get(options.metricsPath, asyncHandler(async (req, res, next) => {
      res.set('Content-Type', prometheus.register.contentType)
      res.send(await prometheus.register.metrics())
    }))
    if (options.collectDefaultMetrics === true) {
      prometheus.collectDefaultMetrics()
    }
    return app
  }
}

export default { MetricsServer, httpMetricsMiddleware, grpcMetricsInterceptor }
export { MetricsServer, httpMetricsMiddleware, grpcMetricsInterceptor }
