const sayHelloWorld = (req, res) => res.send('Hello World!')
const responseHealth = (req, res) => res.json({ status: 'ok' })
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
  console.log('errorEndpoint')
  throw new Error('I am error!')
  // res.status(500).json('error occurred')
}
const waitMilliSeconds = (ms) => {
  const start = new Date().getTime()
  let end = start
  while (end < start + ms) {
    end = new Date().getTime()
  }
}
const responseAsync = async (req, res) => {
  console.log('asyncEndpoint Start Timing')
  await waitMilliSeconds(3000)
  console.log('asyncEndpoint Time\'s up')
  // throw new Error('I am error!')
  res.status(200).json('async completed')
}
export default { sayHelloWorld, responseHealth, echoYourRequest, responseError, responseAsync }
