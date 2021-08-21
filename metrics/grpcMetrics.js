import prometheus from 'prom-client'
import { status, statusesByCodes } from '../utility.js'
import jsonLogger from '../logs/index.js'

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
  err.code = (err.code === undefined) ? status.INTERNAL : err.code
  err.message = (err.message === undefined) ? statusesByCodes.get(err.code) : err.message
  ctx.setStatus({
    statusCode: err.code,
    statusDescription: statusesByCodes.get(err.code)
  })
  ctx.res = err
  const { service, name: method } = ctx
  jsonLogger.error(err.message, { service, method, statusCode: err.code })
}

const grpcMetricsInterceptor = async (ctx, next) => {
  const { service, name: method } = ctx
  grpcRequestsInflight.inc({
    service, method
  })
  // check this: https://stackoverflow.com/a/14551263/8694937
  // maybe use process.hrtime() would more like a pro
  const start = new Date().getTime()
  try {
    await next()
  } catch (err) {
    grpcErrorHandler(err, ctx)
  } finally {
    const duration = (new Date().getTime() - start) / 1000
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
