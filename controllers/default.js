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
  const response = req.body
  const time = new Date()
  response.timestr = time
  response.timestamp = time.getTime()
  res.status(200).json(response)
}
export default { sayHelloWorld, responseHealth, echoYourRequest }
