import { URL } from 'url'
import path from 'path'
import gRPCConfig from '../services/grpcconfig.js'

const __dirname = new URL('.', import.meta.url).pathname
const PROTO_PATH = path.join(__dirname + '/../protos/ping.proto')
const protoDescriptor = gRPCConfig.GetProtoDescriptor(PROTO_PATH)

function sendRequest () {
  const target = 'localhost:8081'
  const client = new protoDescriptor.Ping(target, gRPCConfig.grpc.credentials.createInsecure())

  client.Testing({ message_id: 'qwert', message_body: 'hello ping service' }, function (err, response) {
    console.log(response)
    if (err) {
      console.log(err)
    }
  })
}

sendRequest()
