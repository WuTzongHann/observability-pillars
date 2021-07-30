'use strict';

module.exports = {
  startServer: function () {
    const PROTO_PATH = __dirname +'/../protos/ping.proto';
    let grpc = require('@grpc/grpc-js');
    let protoLoader = require('@grpc/proto-loader');
    let packageDefinition = protoLoader.loadSync(
      PROTO_PATH,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });
    let protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    let ping_proto = protoDescriptor.ping;
    let port = 8081;

    // Implements the Echo RPC method.
    function Echo(call, callback) {
      const RECIEVED_TIME = new Date;
      let response = {
        echo_request: {
          message_id: call.request.message_id,
          message_body: call.request.message_body
        },
        timestr: RECIEVED_TIME,
        timestamp: RECIEVED_TIME.getTime()
      };
      callback(null, response);
    }

    // Starts an RPC server that receives requests for the Ping service at the sample server port
    function createGRPCServer() {
      let server = new grpc.Server();
      server.addService(ping_proto.Ping.service, { Echo: Echo });
      server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log(`gRPC Server listening at http://localhost:${port}`);
      });
    }

    createGRPCServer();
  }
}