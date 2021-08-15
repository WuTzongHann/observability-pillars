import prometheus from 'prom-client'

const grpcRequestTotalCounter = new prometheus.Counter({
  name: 'grpc_requests_total',
  help: 'Total number of gRPC requests.',
  labelNames: ['method', 'statusCode']
})
const grpcRequestDurationHist = new prometheus.Histogram({
  name: 'grpc_request_duration_seconds',
  help: 'The latency of the gRPC requests.',
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ['method', 'statusCode']
})
const grpcResponseSizeHistogram = new prometheus.Histogram({
  name: 'grpc_response_size_bytes',
  help: 'The size of the gRPC responses.',
  buckets: prometheus.exponentialBuckets(100, 10, 8),
  labelNames: ['method', 'statusCode']
})
const grpcRequestsInflight = new prometheus.Gauge({
  name: 'grpc_requests_in_flight',
  help: 'The number of inflight gRPC requests being handled at the same time.',
  labelNames: ['method']
})

const grpcMetricsInterceptor = (ctx, next) => {
  const start = new Date().getTime()
  next()
  const time = new Date().getTime() - start
  const method = ctx.fullName
  grpcRequestsInflight.inc({
    method: method
  })
  const statusCode = ctx.response.status.statusCode
  console.log(method, statusCode)
  const sizeBytes = new Int8Array(ctx.res.arrayBuffer).length
  grpcRequestTotalCounter.inc({
    method: method,
    statusCode: statusCode
  })
  grpcRequestDurationHist.observe({
    method: method,
    statusCode: statusCode
  }, time)
  grpcResponseSizeHistogram.observe({
    method: method,
    statusCode: statusCode
  }, sizeBytes)
  grpcRequestsInflight.inc({
    method: method
  }, -1)
}

export default grpcMetricsInterceptor
export { grpcMetricsInterceptor }
