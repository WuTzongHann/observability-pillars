import express from 'express'
import prometheus from 'prom-client'
import httpMetricsMiddleware from './httpMetrics.js'
import grpcMetricsInterceptor from './grpcMetrics.js'
import Logger from '../logs/index.js'

const defaultOptions = {
  port: 9090,
  path: '/metrics',
  collectDefaultMetrics: true,
  logger: new Logger()
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
    app.get(options.path, asyncHandler(async (req, res, next) => {
      res.set('Content-Type', prometheus.register.contentType)
      res.send(await prometheus.register.metrics())
      const { originalUrl: urlPath, method } = req
      options.logger.info('User Visited', { urlPath, method, statusCode: res.statusCode })
    }))
    app.listen(options.port, () => {
      options.logger.info(`Metrics Server listening at http://localhost:${options.port}`)
    })
    if (options.collectDefaultMetrics === true) {
      prometheus.collectDefaultMetrics()
    }
  }

  httpMiddleware () {
    return httpMetricsMiddleware
  }

  grpcInterceptor () {
    return grpcMetricsInterceptor
  }
}

export default Metrics
