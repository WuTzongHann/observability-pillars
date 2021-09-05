# Clone from GitHub
```
git clone https://github.com/WuTzongHann/observability-pillars.git
cd nodejsserver
```

# Install the dependencies
```
npm install
```

# Run Server
```
npm run startServer
```
-> Example Result
```
HTTP Server listening at http://localhost:8080
gRPC Server listening at http://localhost:8081
```

# HTTP Test
Hello World
```
npm run testhttphelloworld
```
-> Example Result
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 12
ETag: W/"c-Lve95gjOVATpfV8EL5X4nxwjKHE"
Date: Tue, 03 Aug 2021 12:25:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Hello World!
```
Get Health
```
npm run testhttphealth
```
-> Example Result
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
Date: Tue, 03 Aug 2021 12:25:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok"}
```
Post Echo
```
npm run testhttpecho
```
-> Example Result
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 121
ETag: W/"79-irbO1QtgYEZN3GpkVJ061dP3kmo"
Date: Tue, 03 Aug 2021 12:26:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{
  "message_id":"qwert",
  "message_body":"hello ping service",
  "timestr":"2021-08-03T12:26:53.964Z",
  "timestamp":1627993613964
}
```

# gRPC Test
Echo
```
npm run testgrpcecho
```
-> Example Result
```
{
  echo_request: { message_id: 'qwert', message_body: 'hello ping service' },
  timestr: 'Tue Aug 03 2021 20:28:03 GMT+0800 (Taipei Standard Time)',
  timestamp: '1627993683844'
}
```
Testing
```
npm run testgrpctesting
```
-> Example Result
```
{
  echo_request: { message_id: 'testing', message_body: 'testing' },
  timestr: 'Tue Aug 03 2021 20:28:25 GMT+0800 (Taipei Standard Time)',
  timestamp: '1627993705922'
}
```

