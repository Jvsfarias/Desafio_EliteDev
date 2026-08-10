import { Router } from 'express'
import { create, listMovies } from '../controllers/event.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/movies', listMovies)
router.post('/', authenticate, requireRole('organizador'), create)

export default router
