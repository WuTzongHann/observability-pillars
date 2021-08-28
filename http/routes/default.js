import express from 'express'
import defaultController from '../controllers/default.js'
// workaround solution for silence reject
// ref: https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
const asyncHandler = fn => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next)
}
const notAllowedMethod = (req, res) => {
  res.status(405).send()
  res.locals.logger.error('Method Not Allowed', { statusCode: res.statusCode })
}
const router = express.Router()
router.route('/')
  .get(defaultController.sayHelloWorld)
  .all(notAllowedMethod)
router.route('/health')
  .get(defaultController.responseHealth)
  .all(notAllowedMethod)
router.route('/echo')
  .post(defaultController.echoYourRequest)
  .all(notAllowedMethod)
router.route('/gotoHTTP')
  .get(defaultController.gotoHTTP)
  .all(notAllowedMethod)
router.route('/gotoGRPC')
  .get(defaultController.gotoGRPC)
  .all(notAllowedMethod)
router.route('/error')
  .get(defaultController.responseError)
  .all(notAllowedMethod)
router.route('/async')
  .get(asyncHandler(defaultController.responseAsync))
  .all(notAllowedMethod)

export default router
