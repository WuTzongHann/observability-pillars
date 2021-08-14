const sayHelloWorld = (req, res) => {
  res.send('Hello World!')
}

const responseHealth = (req, res) => {
  res.json({ status: 'ok' })
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
  res.json(response)
}

export default { sayHelloWorld, responseHealth, echoYourRequest }
