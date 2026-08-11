import { Router } from 'express'
import {
  cancel,
  create,
  getById,
  listMovies,
  listShows,
  search,
  update,
} from '../controllers/event.controller.js'
import { book, getAreas, getSeats } from '../controllers/booking.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/movies', listMovies)
router.get('/shows', listShows)
router.get('/search', search)
router.get('/:id', getById)
router.get('/:id/seats', getSeats)
router.get('/:id/areas', getAreas)
router.post('/:id/book', authenticate, book)
router.post('/:id/cancel', authenticate, requireRole('organizador'), cancel)
router.put('/:id', authenticate, requireRole('organizador'), update)
router.post('/', authenticate, requireRole('organizador'), create)

export default router
