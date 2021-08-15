import express from 'express'
import Mali from 'mali'
import defaultRouter from './http/routes/default.js'
import patientsRouter from './http/routes/patients.js'
import {
  httpMetricsMiddleware,
  grpcMetricsInterceptor
} from './metrics/index.js'
import {
  unsupportedMediaTypeHandler,
  notFoundHandler,
  errorHandler
} from './http/handlers/index.js'
import {
  echo,
  testing
} from './grpc/services/ping.js'

const HTTP_PORT = 8080
const GRPC_PORT = 8081
const PROTO_PATH = './grpc/protos/ping.proto'

const main = async () => {
  const httpServer = express()
  httpServer.use(httpMetricsMiddleware())
  httpServer.use(unsupportedMediaTypeHandler)
  httpServer.use(express.json())
  httpServer.use(defaultRouter)
  httpServer.use('/patients', patientsRouter)
  httpServer.use(notFoundHandler)
  httpServer.use(errorHandler)
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server listening at http://localhost:${HTTP_PORT}`)
  })

  

  const gRPCServer = new Mali(PROTO_PATH)
  gRPCServer.use(grpcMetricsInterceptor)
  gRPCServer.use({ echo, testing })
  // gRPCServer.on('error', grpcErrorHandler)
  await gRPCServer.start(`0.0.0.0:${GRPC_PORT}`)
  console.log(`gRPC Server listening at http://localhost:${GRPC_PORT}`)
}

main()
