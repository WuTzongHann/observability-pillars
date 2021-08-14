import express from 'express'
import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

import defaultRouter from './http/routes/default.js'
import patientsRouter from './http/routes/patients.js'

import pingService from './grpc/services/ping.js'

import metricsMiddleware from './http/middlewares/metrics.js'

const HTTP_PORT = 8080
const GRPC_PORT = 8081
const PingProtoPath = './grpc/protos/ping.proto'

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

// Handlers
const unsupportedMediaTypeHandler = (req, res, next) => {
  if (!req.is('application/json')) {
    res.status(415).send('Your content-type is not "application/json" or You did not provide any data.')
    return
  }
  next()
}
const notFoundHandler = (req, res) => {
  res.status(404).send('Sorry can\'t find that!')
}
const errorHandler = (err, req, res, next) => {
  res.status((err.statusCode === undefined) ? 500 : err.statusCode).json({ error: err })
}

const main = () => {
  const httpServer = express()
  httpServer.use(metricsMiddleware())
  httpServer.use(unsupportedMediaTypeHandler)
  httpServer.use(express.json())
  httpServer.use(defaultRouter)
  httpServer.use('/patients', patientsRouter)
  httpServer.use(notFoundHandler)
  httpServer.use(errorHandler)
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server listening at http://localhost:${HTTP_PORT}`)
  })

  const pingDescriptor = loadProtoDescriptor(PingProtoPath)
  const gRPCServer = new grpc.Server()
  gRPCServer.addService(pingDescriptor.Ping.service, { Echo: pingService.Echo, Testing: pingService.Testing })
  gRPCServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    gRPCServer.start()
    console.log(`gRPC Server listening at http://localhost:${GRPC_PORT}`)
  })
}

main()
