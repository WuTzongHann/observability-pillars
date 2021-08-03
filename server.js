import express from 'express'
import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

import defaultRouter from './routes/default.js'
import healthRouter from './routes/health.js'
import pingServices from './grpc/services/ping.js'

const HTTP_PORT = 8080
const GRPC_PORT = 8081

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

const main = () => {
  const httpServer = express()
  httpServer.use(express.json())
  httpServer.use('/', defaultRouter)
  httpServer.use('/health', healthRouter)
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server listening at http://localhost:${HTTP_PORT}`)
  })

  const pingProtoPath = './grpc/protos/ping.proto'
  const pingDescriptor = loadProtoDescriptor(pingProtoPath)
  const gRPCServer = new grpc.Server()
  gRPCServer.addService(pingDescriptor.Ping.service, { Echo: pingServices.Echo, Testing: pingServices.Testing })
  gRPCServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    gRPCServer.start()
    console.log(`gRPC Server listening at http://localhost:${GRPC_PORT}`)
  })
}

main()
