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
  .post(asyncHandler(defaultController.echoYourRequest))
  .all(notAllowedMethod)
router.route('/error')
  .get(defaultController.responseError)
  .all(notAllowedMethod)
router.route('/error2')
  .get(defaultController.responseError)
  .all(notAllowedMethod)
router.route('/error4')
  .get(defaultController.responseError)
  .all(notAllowedMethod)
router.route('/error3')
  .get(defaultController.responseError)
  .all(notAllowedMethod)
router.route('/error5')
  .get(defaultController.responseError)
  .all(notAllowedMethod)
export default router
