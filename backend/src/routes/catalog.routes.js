import { Router } from 'express'
import { listMovies, listShowCatalog } from '../controllers/catalog.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/movies', authenticate, requireRole('organizador'), listMovies)
router.get('/shows', authenticate, requireRole('organizador'), listShowCatalog)

export default router
