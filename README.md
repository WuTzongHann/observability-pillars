# NodeJSServer

Activate Server
```
node scripts/index.js
```

Test HTTP server
```
curl --request POST \
-i \
--url http://localhost:8080/echo \
--header 'content-type: application/json' \
--data '{"message_id": "qwert","message_body": "hello ping service"}'
```

Test gRPC Server
```
node scripts/gRPCClient.js
```
