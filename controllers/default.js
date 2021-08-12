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
  if (req.headers['content-type'] !== 'application/json') {
    res.status(415).send('content-type only accept "application/json"')
  } else {
    if (req.body.message_id === undefined || req.body.message_body === undefined) {
      res.status(500).send('provided data have undefined property')
    } else {
      const response = req.body
      const time = new Date()
      response.timestr = time
      response.timestamp = time.getTime()
      res.status(200).json(response)
    }
  }
}
export default { sayHelloWorld, responseHealth, echoYourRequest }
