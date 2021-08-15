import httpMetricsMiddleware from './httpMetrics.js'
import grpcMetricsInterceptor from './grpcMetrics.js'

import prometheus from 'prom-client'
prometheus.collectDefaultMetrics()

export default { httpMetricsMiddleware, grpcMetricsInterceptor }
export { httpMetricsMiddleware, grpcMetricsInterceptor }
