import express from 'express'
import healthController from '../controllers/health.js'

const notAllowedMethod = (req, res) => {
  res.status(405).send()
}
const router = express.Router()
router.route('/')
  .get(healthController.responseHealth)
  .all(notAllowedMethod)

export default router
