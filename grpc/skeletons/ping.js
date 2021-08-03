import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import { URL } from 'url'
import path from 'path'

const __dirname = new URL('.', import.meta.url).pathname
const PROTO_PATH = path.join(__dirname + '/../protos/ping.proto')
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
const echo = function (call, callback) {
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

export default {
  ProtoDescriptor: protoDescriptor,
  Echo: echo
}
