const unsupportedMediaType = async (req, res, next) => {
  if (!req.is('application/json')) {
    res.status(415).send('Your content-type is not "application/json" or You did not provide any data.')
    const { originalUrl: urlPath, method } = req
    res.locals.logger.error('Your content-type is not "application/json" or You did not provide any data.', { urlPath, method, statusCode: res.statusCode })
    return
  }
  await next()
}
const notFound = (req, res) => {
  res.status(404).send('Sorry can\'t find that!')
  const { originalUrl: urlPath, method } = req
  res.locals.logger.error('Sorry can\'t find that!', { urlPath, method, statusCode: res.statusCode })
}
const error = (err, req, res, next) => {
  res.status((err.statusCode === undefined) ? 500 : err.statusCode).json({ error: err })
  const { originalUrl: urlPath, method } = req
  res.locals.logger.error(err, { urlPath, method, statusCode: res.statusCode })
}

export default { unsupportedMediaType, notFound, error }
