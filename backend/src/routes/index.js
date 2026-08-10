import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import eventRoutes from './event.routes.js'
import catalogRoutes from './catalog.routes.js'
import ticketRoutes from './ticket.routes.js'

const router = Router()

router.use(healthRoutes)
router.use('/auth', authRoutes)
router.use('/events', eventRoutes)
router.use('/catalog', catalogRoutes)
router.use('/tickets', ticketRoutes)

export default router
