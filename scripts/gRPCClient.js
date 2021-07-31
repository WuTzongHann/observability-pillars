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
const pingProto = protoDescriptor.ping

function sendRequest () {
  const target = 'localhost:8081'
  const client = new pingProto.Ping(target, grpc.credentials.createInsecure())

  client.Echo({ message_id: 'qwert', message_body: 'hello ping service' }, function (err, response) {
    console.log(response)
    console.log(err)
  })
}

sendRequest()
