import { Router } from 'express'
import { listLogs } from '../controllers/log.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', authenticate, requireRole('organizador'), listLogs)

export default router
