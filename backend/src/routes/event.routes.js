import { Router } from 'express'
import { create, getById, listMovies, listShows, update } from '../controllers/event.controller.js'
import { book, getAreas, getSeats } from '../controllers/booking.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/movies', listMovies)
router.get('/shows', listShows)
router.get('/:id', getById)
router.get('/:id/seats', getSeats)
router.get('/:id/areas', getAreas)
router.post('/:id/book', authenticate, book)
router.put('/:id', authenticate, requireRole('organizador'), update)
router.post('/', authenticate, requireRole('organizador'), create)

export default router
