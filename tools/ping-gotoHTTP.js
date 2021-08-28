import path from 'path'
import GRPCClient from 'node-grpc-client'

const PROTO_PATH = path.resolve('../grpc/protos/ping.proto')
const myClient = new GRPCClient(PROTO_PATH, 'myPing', 'Ping', 'localhost:8081')
const options = { metadata: {} }
options.metadata = {
  'x-request-id': 'exampleXRequestId',
  'x-b3-traceid': 'exampleXB3TraceId',
  'x-b3-spanid': 'exampleXB3SpanId',
  'x-b3-parentspanid': 'exampleXB3ParentId'
}

myClient.runService('gotoHTTP', { message_id: 'qwert', message_body: 'hello ping service' }, (err, res) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('Service response ', res)
}, options)
