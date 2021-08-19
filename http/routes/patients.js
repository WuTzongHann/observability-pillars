import express from 'express'
import patientsController from '../controllers/patients.js'
import { jsonLogger } from '../../logs/index.js'

const notAllowedMethod = (req, res) => {
  res.status(405).send()
  jsonLogger.error('Method Not Allowed', { statusCode: res.statusCode })
}
const router = express.Router()
router.route('/')
  .get(patientsController.responseHello)
  .all(notAllowedMethod)

export default router
