import { jsonLogger } from '../../logs/index.js'

const unsupportedMediaTypeHandler = (req, res, next) => {
  if (!req.is('application/json')) {
    res.status(415).send('Your content-type is not "application/json" or You did not provide any data.')
    const { originalUrl: urlPath, method } = req
    jsonLogger.error('Your content-type is not "application/json" or You did not provide any data.', { urlPath, method, statusCode: res.statusCode })
    return
  }
  next()
}
const notFoundHandler = (req, res) => {
  res.status(404).send('Sorry can\'t find that!')
  const { originalUrl: urlPath, method } = req
  jsonLogger.error('Sorry can\'t find that!', { urlPath, method, statusCode: res.statusCode })
}
const errorHandler = (err, req, res, next) => {
  res.status((err.statusCode === undefined) ? 500 : err.statusCode).json({ error: err })
  const { originalUrl: urlPath, method } = req
  jsonLogger.error(err, { urlPath, method, statusCode: res.statusCode })
}

export { unsupportedMediaTypeHandler, notFoundHandler, errorHandler }
