import express from 'express'
import patientsController from '../controllers/patients.js'

const notAllowedMethod = (req, res) => {
  res.status(405).send()
}
const router = express.Router()
router.route('/')
  .get(patientsController.responseHello)
  .all(notAllowedMethod)

export default router
