import express from 'express'
import defaultController from '../controllers/default.js'

const notAllowedMethod = (req, res) => {
  res.status(405).send()
}
const router = express.Router()
router.all((req, res) => {
  res.status(405).send()
})
router.route('/')
  .get(defaultController.sayHelloWorld)
router.route('/health')
  .get(defaultController.responseHealth)
router.route('/echo')
  .post(defaultController.echoYourRequest)
  .all(notAllowedMethod)

export default router
