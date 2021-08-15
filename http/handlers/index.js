const unsupportedMediaTypeHandler = (req, res, next) => {
  if (!req.is('application/json')) {
    res.status(415).send('Your content-type is not "application/json" or You did not provide any data.')
    return
  }
  next()
}
const notFoundHandler = (req, res) => {
  res.status(404).send('Sorry can\'t find that!')
}
const errorHandler = (err, req, res, next) => {
  res.status((err.statusCode === undefined) ? 500 : err.statusCode).json({ error: err })
}

export { unsupportedMediaTypeHandler, notFoundHandler, errorHandler }
