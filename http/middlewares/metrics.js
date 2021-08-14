import express from 'express'
import prometheus from 'prom-client'
import responseTime from 'response-time'

const httpRequestTotalCounter = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests.',
  labelNames: ['urlPath', 'statusCode']
})
const httpRequestDurationHist = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'The latency of the HTTP requests.',
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ['urlPath', 'statusCode']
})
const httpResponseSizeHistogram = new prometheus.Histogram({
  name: 'http_response_size_bytes',
  help: 'The size of the HTTP responses.',
  buckets: prometheus.exponentialBuckets(100, 10, 8),
  labelNames: ['urlPath', 'statusCode']
})
const httpRequestsInflight = new prometheus.Gauge({
  name: 'http_requests_in_flight',
  help: 'The number of inflight requests being handled at the same time.',
  labelNames: ['urlPath']
})

// httpMetricsRecorder measures the server-side stats, like latencies and respond status, and group by the method calls.
const httpMetricsRecorder = (req, res, time) => {
  const urlPath = req.originalUrl
  httpRequestsInflight.inc({
    urlPath: urlPath
  })
  const statusCode = res.statusCode
  const sizeBytes = new Int8Array(res.arrayBuffer).length
  httpRequestTotalCounter.inc({
    urlPath: urlPath,
    statusCode: statusCode
  })
  httpRequestDurationHist.observe({
    urlPath: urlPath,
    statusCode: statusCode
  }, time)
  httpResponseSizeHistogram.observe({
    urlPath: urlPath,
    statusCode: statusCode
  }, sizeBytes)
  httpRequestsInflight.inc({
    urlPath: urlPath
  }, -1)
}

// workaround solution for silence reject
// ref: https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
const asyncHandler = fn => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next)
}

const myMetricsMiddleware = () => {
  prometheus.collectDefaultMetrics() // Default metrics are collected on scrape of metrics endpoint
  const app = express()
  app.use(responseTime(httpMetricsRecorder))
  app.get('/metrics', asyncHandler(async (req, res, next) => {
    res.set('Content-Type', prometheus.register.contentType)
    res.send(await prometheus.register.metrics())
  }))

  return app
}

export default myMetricsMiddleware
