import { Router } from 'express'
import { create, getMovie, listMovies } from '../controllers/event.controller.js'
import { book, getSeats } from '../controllers/booking.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/movies', listMovies)
router.get('/:id', getMovie)
router.get('/:id/seats', getSeats)
router.post('/:id/book', authenticate, book)
router.post('/', authenticate, requireRole('organizador'), create)

export default router
