import express from 'express'
import defaultController from '../controllers/default.js'

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
