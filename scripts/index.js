'use strict'

const httpServer = require('./HTTPServer')
httpServer.startServer()

const gRPCServer = require('./gRPCServer')
gRPCServer.startServer()
