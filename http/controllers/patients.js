const responseHello = (req, res) => {
  res.send('Hello patients!')
  const { originalUrl: urlPath, method } = req
  res.locals.logger.info('User Visited', { urlPath, method, statusCode: res.statusCode })
}

export default { responseHello }
