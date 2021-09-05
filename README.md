# Clone from GitHub
```
git clone https://github.com/WuTzongHann/observability-pillars.git
cd observability-pillars
```

# Install the dependencies
```
npm install
```

# Run Server
```
npm run startserver
```
-> Example Result
```
{"level":"info","timestamp":"2021-09-05T16:17:35.980Z","caller":"(../metrics/index.js:33)","message":"Metrics Server listening at http://localhost:9090"}
{"level":"info","timestamp":"2021-09-05T16:17:35.983Z","caller":"(server.js:29)","message":"HTTP Server listening at http://localhost:8080"}
{"level":"info","timestamp":"2021-09-05T16:17:35.988Z","caller":"(server.js:34)","message":"grpc Server listening at http://localhost:8081"}
```

# HTTP Test
Hello World
```
npm run httphelloworld
```
-> Example Result
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 12
ETag: W/"c-Lve95gjOVATpfV8EL5X4nxwjKHE"
Date: Sun, 05 Sep 2021 16:18:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Hello World!
```
Health
```
npm run httphealth
```
-> Example Result
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
Date: Sun, 05 Sep 2021 16:19:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok"}
```
Echo
```
npm run httpecho
```
-> Example Result
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 118
ETag: W/"76-bPyPvjdZC80ryrESeg1wBvM/Phs"
Date: Sun, 05 Sep 2021 16:19:54 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{
  "message_id":"exampleId",
  "message_body":"exampleBody",
  "timestr":"2021-09-05T16:19:54.271Z",
  "timestamp":1630858794271
}
```
Others...
```
# GotoHTTP
npm run httpgotohttp

# GotoGRPC
npm run httpgotogrpc

# ErrorTest
npm run httperror

# AsyncTest
npm run httpasync
```

# gRPC Test
Health
```
npm run grpchealth
```
-> Example Result
```
Service response  { response: '{"status":"ok"}' }
```
Echo
```
npm run grpcecho
```
-> Example Result
```
Service response  {
  echo_request: { message_id: 'exampleId', message_body: 'exampleBody' },
  timestr: 'Mon Sep 06 2021 00:27:10 GMT+0800 (Taipei Standard Time)',
  timestamp: '1630859230648'
}
```
Others...
```
# GotoHTTP
npm run grpcgotohttp

# GotoGRPC
npm run grpcgotogrpc

# ErrorTest
npm run grpcerror

# AsyncTest
npm run grpcasync
```

# Scrape Metrics
```
npm run scrapemetrics
```


