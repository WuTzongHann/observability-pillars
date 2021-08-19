import { status, statusesByCodes } from '../../utility.js'
import { jsonLogger } from '../../logs/index.js'

const echo = (ctx) => {
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
  const { service, name: method } = ctx
  jsonLogger.info('User Visited', { service, method, statusCode: ctx.response.status.statusCode })
}
const waitMilliSeconds = (ms) => {
  const start = new Date().getTime()
  let end = start
  while (end < start + ms) {
    end = new Date().getTime()
  }
}
const testing = async (ctx) => {
  await waitMilliSeconds(1000)
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
  const { service, name: method } = ctx
  jsonLogger.info('User Visited', { service, method, statusCode: ctx.response.status.statusCode })
}

export default { echo, testing }
export { echo, testing, status, statusesByCodes }
