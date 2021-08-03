import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

const GetProtoDescriptor = function (protoPath) {
  const PROTO_PATH = protoPath
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
  return protoDescriptor
}

export default { grpc, GetProtoDescriptor }
