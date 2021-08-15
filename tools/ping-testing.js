import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

const PROTO_PATH = '../grpc/protos/ping.proto'
const protoLoaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
}
const packageDefinition = protoLoader.loadSync(PROTO_PATH, protoLoaderOptions)
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)

function sendRequest () {
  const target = 'localhost:8081'
  const client = new protoDescriptor.Ping(target, grpc.credentials.createInsecure())

  client.Testing({ message_id: 'qwert', message_body: 'hello ping service' }, function (err, response) {
    if (err) {
      console.log(err)
      return
    }
    console.log(response)
  })
}

sendRequest()
