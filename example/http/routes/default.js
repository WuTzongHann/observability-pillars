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
  .get(defaultController.helloWorld)
  .all(notAllowedMethod)
router.route('/health')
  .get(defaultController.health)
  .all(notAllowedMethod)
router.route('/echo')
  .post(defaultController.echo)
  .all(notAllowedMethod)
router.route('/gotoHTTP')
  .get(defaultController.gotoHTTP)
  .all(notAllowedMethod)
router.route('/gotoGRPC')
  .get(defaultController.gotoGRPC)
  .all(notAllowedMethod)
router.route('/errorTest')
  .get(defaultController.errorTest)
  .all(notAllowedMethod)
router.route('/asyncTest')
  .get(asyncHandler(defaultController.asyncTest))
  .all(notAllowedMethod)

export default router
