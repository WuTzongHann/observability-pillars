const Echo = function (call, callback) {
  const receivedTime = new Date()
  const response = {
    echo_request: {
      message_id: call.request.message_id,
      message_body: call.request.message_body
    },
    timestr: receivedTime,
    timestamp: receivedTime.getTime()
  }
  callback(null, response)
}
const Testing = function (call, callback) {
  const receivedTime = new Date()
  const response = {
    echo_request: {
      message_id: 'testing',
      message_body: 'testing'
    },
    timestr: receivedTime,
    timestamp: receivedTime.getTime()
  }
  callback(null, response)
}

export default { Echo, Testing }
