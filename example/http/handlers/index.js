const unsupportedMediaType = async (req, res, next) => {
  if (!req.is('application/json')) {
    res.status(415).send('Your content-type is not "application/json" or You did not provide any data.')
    return
  }
  await next()
}

const notFound = (req, res) => {
  res.status(404).send('Sorry can\'t find that!')
}

const error = (err, req, res, next) => {
  res.status((err.statusCode === undefined) ? 500 : err.statusCode).json({ error: err })
}

export default { unsupportedMediaType, notFound, error }
