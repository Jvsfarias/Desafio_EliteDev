import { Router } from 'express'
import { listMovies } from '../controllers/catalog.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/movies', authenticate, requireRole('organizador'), listMovies)

export default router
