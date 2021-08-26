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

export default { sayHelloWorld, responseHealth, echoYourRequest }
