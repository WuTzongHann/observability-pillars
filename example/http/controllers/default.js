import axios from 'axios'
import GRPCClient from 'node-grpc-client'
import traces from '../../../traces/index.js'

const returnAnError = () => {
  throw new Error('I am error!')
}

const waitMilliSeconds = (ms) => {
  const start = new Date().getTime()
  let end = start
  while (end < start + ms) {
    end = new Date().getTime()
  }
}

const helloWorld = (req, res) => {
  res.send('Hello World!')
}

const health = (req, res) => {
  res.json({ status: 'ok' })
}

const echo = (req, res) => {
  if (req.body.message_id === undefined || req.body.message_body === undefined) {
    res.status(400).send('provided data have undefined property')
    return
  }
  const response = req.body
  const time = new Date()
  response.timestr = time
  response.timestamp = time.getTime()
  res.json(response)
}

const gotoHTTP = async (req, res, next) => {
  const newHeaders = { 'content-type': 'application/json' }
  traces.SetOutgoingHeaderWithTraceFromHeader(req.headers, newHeaders)
  await axios.get('http://localhost:8080/health',
    {
      headers: newHeaders,
      data: {
        message_id: 'qwert',
        message_body: 'hello ping service'
      }
    })
    .then((response) => {
      res.json(response.data)
    })
    .catch(err => next(err))
}

const gotoGRPC = async (req, res, next) => {
  const PROTO_PATH = './grpc/protos/ping.proto'
  const myClient = new GRPCClient(PROTO_PATH, 'myPing', 'Ping', 'localhost:8081')
  const options = { metadata: {} }
  options.metadata = traces.NewOutgoingContextWithTraceFromHeader(req.headers)

  await myClient.healthSync({ message_id: 'qwert', message_body: 'hello ping service' }, options)
    .then(response => {
      res.json(JSON.parse(response.response))
    })
    .catch(err => next(err))
}

const errorTest = (req, res) => {
  returnAnError()
  res.status(500).json('error occurred')
}

const asyncTest = async (req, res) => {
  await waitMilliSeconds(1000)
  res.status(200).json('async completed')
}

export default { helloWorld, health, echo, gotoHTTP, gotoGRPC, errorTest, asyncTest }
