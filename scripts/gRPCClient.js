'use strict';

const PROTO_PATH = __dirname + '/../protos/ping.proto';
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

function sendRequest() {
  let target = 'localhost:8081';
  let client = new ping_proto.Ping(target, grpc.credentials.createInsecure());
    
  client.Echo({ message_id: "qwert", message_body: "hello ping service" }, function (err, response) {
    console.log(response);
  });
}

sendRequest();