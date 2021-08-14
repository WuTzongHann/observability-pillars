import express from 'express'
import client from 'prom-client'
import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

import defaultRouter from './http/routes/default.js'
import testRouter from './http/routes/test.js'
import pingServices from './grpc/services/ping.js'

import responseTime from 'response-time'

const HTTP_PORT = 8080
const GRPC_PORT = 8081
const PingProtoPath = './grpc/protos/ping.proto'
const collectDefaultMetrics = client.collectDefaultMetrics
const httpRequestTotalCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests.',
  labelNames: ['urlPath', 'statusCode']
})
const httpRequestDurationHist = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'The latency of the HTTP requests.',
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ['urlPath', 'statusCode']
})
const httpResponseSizeHistogram = new client.Histogram({
  name: 'http_response_size_bytes',
  help: 'The size of the HTTP responses.',
  buckets: client.exponentialBuckets(100, 10, 8),
  labelNames: ['urlPath', 'statusCode']
})
const httpRequestsInflight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'The number of inflight requests being handled at the same time.',
  labelNames: ['urlPath']
})

const loadProtoDescriptor = protoPath => {
  const packageDefinition = protoLoader.loadSync(
    protoPath,
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    })
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
  return protoDescriptor
}

// workaround solution for silence reject
// ref: https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
const asyncHandler = fn => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next)
}

// httpMetricsRecorder measures the server-side stats, like latencies and respond status, and group by the method calls.
const httpMetricsRecorder = function (req, res, time) {
  const urlPath = req.originalUrl
  httpRequestsInflight.inc({
    urlPath: urlPath
  })
  console.log('time', time)
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

const errorHandler = (err, req, res, next) => {
  res.status((err.statusCode === undefined) ? 500 : err.statusCode).json({ error: err })
}

const main = () => {
  collectDefaultMetrics() // Default metrics are collected on scrape of metrics endpoint
  const httpServer = express()
  httpServer.use(responseTime(httpMetricsRecorder))
  httpServer.use((req, res, next) => {
    if (!req.is('application/json')) {
      res.status(415).send('Your content-type is not "application/json" or You did not provide any data.')
      return
    }
    next()
  })
  httpServer.use(express.json())
  httpServer.get('/metrics', asyncHandler(async (req, res, next) => {
    res.set('Content-Type', client.register.contentType)
    res.send(await client.register.metrics())
  }))
  httpServer.use('/', defaultRouter)
  httpServer.use('/test', testRouter)
  httpServer.use((req, res) => {
    res.status(404).send('Sorry can\'t find that!')
  })
  httpServer.use(errorHandler)
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server listening at http://localhost:${HTTP_PORT}`)
  })

  const pingDescriptor = loadProtoDescriptor(PingProtoPath)
  const gRPCServer = new grpc.Server()
  gRPCServer.addService(pingDescriptor.Ping.service, { Echo: pingServices.Echo, Testing: pingServices.Testing })
  gRPCServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    gRPCServer.start()
    console.log(`gRPC Server listening at http://localhost:${GRPC_PORT}`)
  })
}

main()
