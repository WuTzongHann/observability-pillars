import express from 'express'
import testController from '../controllers/test.js'

const notAllowedMethod = (req, res) => {
  res.status(405).send()
}
const router = express.Router()
router.route('/')
  .get(testController.responseHello)
  .all(notAllowedMethod)

export default router
