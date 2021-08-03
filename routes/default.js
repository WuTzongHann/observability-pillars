import express from 'express'

import defaultController from '../controllers/default.js'

const router = express.Router()
router.get('/', defaultController.sayHelloWorld)
router.get('/health', defaultController.responseHealth)
router.post('/echo', defaultController.echoYourRequest)

export default router
