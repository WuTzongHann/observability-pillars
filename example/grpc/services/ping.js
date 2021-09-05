import axios from 'axios'
import GRPCClient from 'node-grpc-client'
import traces from '../../../traces/index.js'
import { status, statusesByCodes } from '../../../utility/index.js'

const throwError = (statusCode) => {
  const err = new Error()
  err.code = statusCode
  err.message = statusesByCodes.get(statusCode)
  throw err
}

const waitMilliSeconds = (ms) => {
  const start = new Date().getTime()
  let end = start
  while (end < start + ms) {
    end = new Date().getTime()
  }
}

const health = async (ctx) => {
  ctx.setStatus({ statusCode: status.OK, statusDescription: statusesByCodes.get(status.OK) })
  const response = JSON.stringify({ status: 'ok' })
  ctx.res = { response }
}

const echo = async (ctx) => {
  const receivedTime = new Date()
  const response = {
    echoRequest: {
      messageId: ctx.req.messageId,
      messageBody: ctx.req.messageBody
    },
    timestr: receivedTime,
    timestamp: receivedTime.getTime()
  }
  ctx.setStatus({ statusCode: status.OK, statusDescription: statusesByCodes.get(status.OK) })
  ctx.res = response
}

const gotoHTTP = async (ctx) => {
  const newHeaders = { 'content-type': 'application/json' }
  traces.SetOutgoingHeaderWithTraceFromContext(ctx.metadata, newHeaders)

  await axios.get('http://localhost:8080/health',
    {
      headers: newHeaders,
      data: {
        message_id: 'exampleId',
        message_body: 'exampleBody'
      }
    })
    .then(response => {
      ctx.setStatus({ statusCode: status.OK, statusDescription: statusesByCodes.get(status.OK) })
      ctx.res = { response: JSON.stringify(response.data) }
    })
}

const gotoGRPC = async (ctx) => {
  const PROTO_PATH = './grpc/protos/ping.proto'
  const myClient = new GRPCClient(PROTO_PATH, 'myPing', 'Ping', 'localhost:8081')
  const options = { metadata: {} }
  options.metadata = traces.NewOutgoingContextWithTraceFromContext(ctx.metadata)
  await myClient.healthSync({ message_id: 'exampleId', message_body: 'exampleBody' }, options)
    .then(response => {
      ctx.setStatus({ statusCode: status.OK, statusDescription: statusesByCodes.get(status.OK) })
      ctx.res = response
    })
}

const errorTest = async (ctx) => {
  throwError(13)
}

const asyncTest = async (ctx) => {
  await waitMilliSeconds(1000)
  ctx.setStatus({ statusCode: status.OK, statusDescription: statusesByCodes.get(status.OK) })
  ctx.res = { response: 'async completed' }
}

export default { health, echo, gotoHTTP, gotoGRPC, errorTest, asyncTest }
