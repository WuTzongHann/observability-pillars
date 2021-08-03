# Clone from GitHub
```
git clone https://github.com/WuTzongHann/nodejsserver.git
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
-> example result
```
HTTP Server listening at http://localhost:8080
gRPC Server listening at http://localhost:8081
```

# HTTP Test
```
npm run testHTTP
```
-> example result
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 121
ETag: W/"79-NZ03aLzg1A5AYAcikVyKGbZODDI"
Date: Fri, 30 Jul 2021 13:44:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{
	"message_id":"qwert",
	"message_body":"hello ping service",
	"timestr":"2021-07-30T13:44:58.225Z",
	"timestamp":1627652698225
}
```

# gRPC Test
```
npm run testgRPC
```
-> example result
```
{
  echo_request: { message_id: 'qwert', message_body: 'hello ping service' },
  timestr: 'Fri Jul 30 2021 21:42:12 GMT+0800 (Taipei Standard Time)',
  timestamp: '1627652532997'
}
```
