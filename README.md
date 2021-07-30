# NodeJSServer
NodeJSServer

Use "node scripts/index.js" to run HTTP server listening to 8080 port and gRPC Server listening to 8081 port

Use the following command to test HTTP server

"curl --request POST \
-i \
--url http://localhost:8080/echo \
--header 'content-type: application/json' \
--data '{"message_id": "qwert","message_body": "hello ping service"}'"

Use "node scripts/gRPCClient.js" to test gRPC Server
