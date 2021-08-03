import express from 'express'
import defaultRouter from './routes/default.js'
import healthRouter from './routes/health.js'
import grpc from '@grpc/grpc-js'
import pingProto from './bin/ping.js'

const httpServer = express()
const httpPort = 8080
httpServer.use(express.json())
httpServer.use('/health', healthRouter)
httpServer.use('/', defaultRouter)
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server listening at http://localhost:${httpPort}`)
})

const gRPCServer = new grpc.Server()
const gRPCPort = 8081
gRPCServer.addService(pingProto.ProtoDescriptor.Ping.service, { Echo: pingProto.Echo })
gRPCServer.bindAsync(`0.0.0.0:${gRPCPort}`, grpc.ServerCredentials.createInsecure(), () => {
  gRPCServer.start()
  console.log(`gRPC Server listening at http://localhost:${gRPCPort}`)
})
