import prometheus from 'prom-client'
import { status, statusesByCodes } from '../utility.js'

const grpcRequestTotalCounter = new prometheus.Counter({
  name: 'grpc_requests_total',
  help: 'Total number of gRPC requests.',
  labelNames: ['service', 'method', 'statusCode']
})
const grpcRequestDurationHist = new prometheus.Histogram({
  name: 'grpc_request_duration_seconds',
  help: 'The latency of the gRPC requests.',
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ['service', 'method', 'statusCode']
})
const grpcResponseSizeHistogram = new prometheus.Histogram({
  name: 'grpc_response_size_bytes',
  help: 'The size of the gRPC responses.',
  buckets: prometheus.exponentialBuckets(100, 10, 8),
  labelNames: ['service', 'method', 'statusCode']
})
const grpcRequestsInflight = new prometheus.Gauge({
  name: 'grpc_requests_in_flight',
  help: 'The number of inflight gRPC requests being handled at the same time.',
  labelNames: ['service', 'method']
})

const grpcErrorHandler = (err, ctx) => {
  err = new Error()
  err.code = status.INTERNAL
  err.message = statusesByCodes.get(status.INTERNAL)
  ctx.setStatus({
    statusCode: err.code,
    statusDescription: statusesByCodes.get(err.code)
  })
  ctx.res = err
  const { service, name: method } = ctx
  ctx.locals.logger.error(err.message, { service, method, statusCode: err.code })
}

// using process.hrtime() for timing
const elapsedTime = function (start) {
  const elapsedTimeInSecond = process.hrtime(start)[0] + (process.hrtime(start)[1] / 1000000000)
  const elapsedTimeInSecondRoundToThreeDecimalPlaces = Math.round(elapsedTimeInSecond * 1000) / 1000
  return elapsedTimeInSecondRoundToThreeDecimalPlaces
}

const grpcMetricsInterceptor = async (ctx, next) => {
  const { service, name: method } = ctx
  grpcRequestsInflight.inc({
    service, method
  })
  const start = process.hrtime()
  try {
    await next()
  } catch (err) {
    grpcErrorHandler(err, ctx)
  } finally {
    const duration = elapsedTime(start)
    const statusCode = ctx.response.status.statusCode
    const sizeBytes = new Int8Array(ctx.res.arrayBuffer).length
    grpcRequestTotalCounter.inc({
      service, method, statusCode
    })
    grpcRequestDurationHist.observe({
      service, method, statusCode
    }, duration)
    grpcResponseSizeHistogram.observe({
      service, method, statusCode
    }, sizeBytes)
    grpcRequestsInflight.inc({
      service, method
    }, -1)
  }
}

export default grpcMetricsInterceptor
