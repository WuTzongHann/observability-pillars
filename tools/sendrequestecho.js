import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import { URL } from 'url'
import path from 'path'

const __dirname = new URL('.', import.meta.url).pathname
const PROTO_PATH = path.join(__dirname + '/../models/protos/ping.proto')

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

function sendRequest () {
  const target = 'localhost:8081'
  const client = new protoDescriptor.Ping(target, grpc.credentials.createInsecure())

  client.Echo({ message_id: 'qwert', message_body: 'hello ping service' }, function (err, response) {
    console.log(response)
    if (err) {
      console.log(err)
    }
  })
}

sendRequest()
