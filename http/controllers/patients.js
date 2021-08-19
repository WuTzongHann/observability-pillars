import jsonLogger from '../../logs/index.js'

const responseHello = (req, res) => {
  res.send('Hello patients!')
  const { originalUrl: urlPath, method } = req
  jsonLogger.info('User Visited', { urlPath, method, statusCode: res.statusCode })
}

export default { responseHello }
