const PROTO_PATH = __dirname.join('/../protos/ping.proto')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)

module.exports = {
  startServer: function () {
    const pingProto = protoDescriptor.ping
    const port = 8081

    // Implements the Echo RPC method.
    function Echo (call, callback) {
      const receivedTime = new Date()
      const response = {
        echo_request: {
          message_id: call.request.message_id,
          message_body: call.request.message_body
        },
        timestr: receivedTime,
        timestamp: receivedTime.getTime()
      }
      callback(null, response)
    }

    // Starts an RPC server that receives requests for the Ping service at the sample server port
    function createGRPCServer () {
      const server = new grpc.Server()
      server.addService(pingProto.Ping.service, { Echo: Echo })
      server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        server.start()
        console.log(`gRPC Server listening at http://localhost:${port}`)
      })
    }

    createGRPCServer()
  }
}
