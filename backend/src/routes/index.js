import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import eventRoutes from './event.routes.js'

const router = Router()

router.use(healthRoutes)
router.use('/auth', authRoutes)
router.use('/events', eventRoutes)

export default router
