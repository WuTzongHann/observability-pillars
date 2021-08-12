const sayHelloWorld = (req, res) => {
  res.send('Hello World!')
}
const responseHealth = (req, res) => {
  const response = {
    status: 'ok'
  }
  res.json(response)
}
const echoYourRequest = (req, res) => {
  if (req.body.message_id === undefined || req.body.message_body === undefined) {
    res.status(400).send('provided data have undefined property')
    return
  }
  const response = req.body
  const time = new Date()
  response.timestr = time
  response.timestamp = time.getTime()
  res.status(200).json(response)
}
const responseError = (req, res) => {
  throw new Error('I am error!')
}
export default { sayHelloWorld, responseHealth, echoYourRequest, responseError }
