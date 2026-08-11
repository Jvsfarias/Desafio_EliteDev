import { Router } from 'express'
import { login, register, updateMe } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.put('/me', authenticate, updateMe)

export default router
