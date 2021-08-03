import express from 'express'
import defaultRouter from './routes/default.js'
import healthRouter from './routes/health.js'
// import grpc from '@grpc/grpc-js'
import pingServices from './grpc/services/ping.js'
import { URL } from 'url'
import path from 'path'
import gRPCConfig from './grpc/services/grpcconfig.js'

const httpServer = express()
const httpPort = 8080
httpServer.use(express.json())
httpServer.use('/', defaultRouter)
httpServer.use('/health', healthRouter)
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server listening at http://localhost:${httpPort}`)
})

const __dirname = new URL('.', import.meta.url).pathname
const PROTO_PATH = path.join(__dirname + '/grpc/protos/ping.proto')
const protoDescriptor = gRPCConfig.GetProtoDescriptor(PROTO_PATH)
const gRPCServer = new gRPCConfig.grpc.Server()
const gRPCPort = 8081
gRPCServer.addService(protoDescriptor.Ping.service, { Echo: pingServices.Echo, Testing: pingServices.Testing })
gRPCServer.bindAsync(`0.0.0.0:${gRPCPort}`, gRPCConfig.grpc.ServerCredentials.createInsecure(), () => {
  gRPCServer.start()
  console.log(`gRPC Server listening at http://localhost:${gRPCPort}`)
})
