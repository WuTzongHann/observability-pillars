import axios from 'axios'
import path from 'path'
import GRPCClient from 'node-grpc-client'
import traces from '../../traces/index.js'

const sayHelloWorld = (req, res) => {
  res.send('Hello World!')
  const { originalUrl: urlPath, method } = req
  res.locals.logger.info('User Visited', { urlPath, method, statusCode: res.statusCode })
}

const responseHealth = (req, res) => {
  res.json({ status: 'ok' })
  const { originalUrl: urlPath, method } = req
  res.locals.logger.info('User Visited', { urlPath, method, statusCode: res.statusCode })
}

const echoYourRequest = (req, res) => {
  if (req.body.message_id === undefined || req.body.message_body === undefined) {
    res.status(400).send('provided data have undefined property')
    const { originalUrl: urlPath, method } = req
    res.locals.logger.error('provided data have undefined property', { urlPath, method, statusCode: res.statusCode })
    return
  }
  const response = req.body
  const time = new Date()
  response.timestr = time
  response.timestamp = time.getTime()
  res.json(response)
  const { originalUrl: urlPath, method } = req
  res.locals.logger.info('User Visited', { urlPath, method, statusCode: res.statusCode })
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
    .then(function (response) {
      res.send(response.data)
      const { originalUrl: urlPath, method } = req
      res.locals.logger.info('User Visited', { urlPath, method, statusCode: res.statusCode })
    })
    .catch(err => next(err))
}

const gotoGRPC = async (req, res, next) => {
  const PROTO_PATH = path.resolve('./grpc/protos/ping.proto')
  const myClient = new GRPCClient(PROTO_PATH, 'myPing', 'Ping', 'localhost:8081')
  const options = { metadata: {} }
  options.metadata = traces.NewOutgoingContextWithTraceFromHeader(req.headers)

  await myClient.echoSync({ message_id: 'qwert', message_body: 'hello ping service' }, options)
    .then(response => {
      console.log('Service response ', response)
      res.json(response)
    })
    .catch(err => next(err))
}

const returnAnError = () => {
  throw new Error('I am error!')
}

const responseError = (req, res) => {
  returnAnError()
  res.status(500).json('error occurred')
}

const waitMilliSeconds = (ms) => {
  const start = new Date().getTime()
  let end = start
  while (end < start + ms) {
    end = new Date().getTime()
  }
}

const responseAsync = async (req, res) => {
  await waitMilliSeconds(3000)
  res.status(200).json('async completed')
}

export default { sayHelloWorld, responseHealth, echoYourRequest, gotoHTTP, gotoGRPC, responseError, responseAsync }
