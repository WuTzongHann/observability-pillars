import prometheus from 'prom-client'
import responseTime from 'response-time'

const httpRequestTotalCounter = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests.',
  labelNames: ['urlPath', 'method', 'statusCode']
})
const httpRequestDurationHist = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'The latency of the HTTP requests.',
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ['urlPath', 'method', 'statusCode']
})
const httpResponseSizeHistogram = new prometheus.Histogram({
  name: 'http_response_size_bytes',
  help: 'The size of the HTTP responses.',
  buckets: prometheus.exponentialBuckets(100, 10, 8),
  labelNames: ['urlPath', 'method', 'statusCode']
})
const httpRequestsInflight = new prometheus.Gauge({
  name: 'http_requests_in_flight',
  help: 'The number of inflight HTTP requests being handled at the same time.',
  labelNames: ['urlPath', 'method']
})

// responseTime(fn) can provide the duration of handling a request (even though it encounters an uncaught error), the fn will be executed while the response is get ready to client
const httpMetricsMiddleware = responseTime((req, res, time) => {
  const { originalUrl: urlPath, method } = req
  httpRequestsInflight.inc({
    urlPath, method
  })
  const elapsedTimeInSecondRoundToThreeDecimalPlaces = Math.round(time) / 1000
  const duration = elapsedTimeInSecondRoundToThreeDecimalPlaces
  const statusCode = res.statusCode
  const sizeBytes = new Int8Array(res.arrayBuffer).length
  httpRequestTotalCounter.inc({
    urlPath, method, statusCode
  })
  httpRequestDurationHist.observe({
    urlPath, method, statusCode
  }, duration)
  httpResponseSizeHistogram.observe({
    urlPath, method, statusCode
  }, sizeBytes)
  httpRequestsInflight.inc({
    urlPath, method
  }, -1)
})

export default httpMetricsMiddleware
