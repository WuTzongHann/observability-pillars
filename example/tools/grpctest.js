import GRPCClient from 'node-grpc-client'

const PROTO_PATH = '../grpc/protos/ping.proto'
const myClient = new GRPCClient(PROTO_PATH, 'myPing', 'Ping', 'localhost:8081')
const options = { metadata: {} }
options.metadata = {
  'x-request-id': 'exampleXRequestId',
  'x-b3-traceid': 'exampleXB3TraceId',
  'x-b3-spanid': 'exampleXB3SpanId',
  'x-b3-parentspanid': 'exampleXB3ParentId'
}

function main (args) {
  const method = (args.length > 0) ? args[0] : 'health'
  myClient.runService(method, { message_id: 'exampleId', message_body: 'exampleBody' }, (err, res) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('Service response ', res)
  }, options)
}

main(process.argv.slice(2))
