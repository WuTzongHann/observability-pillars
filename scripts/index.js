'use strict';

let httpServer = require('./HTTPServer');
httpServer.startServer();

let gRPCServer = require('./gRPCServer');
gRPCServer.startServer();