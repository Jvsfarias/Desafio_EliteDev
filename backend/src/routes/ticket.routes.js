import { Router } from 'express'
import {
  cancel,
  checkTicket,
  getTicket,
  listMine,
  useTicket,
} from '../controllers/ticket.controller.js'
import { authenticate, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/mine', authenticate, listMine)
router.post('/:code/cancel', authenticate, cancel)
router.get('/:code', getTicket)
router.get('/:code/check', authenticate, requireRole('portaria', 'organizador'), checkTicket)
router.post('/:code/use', authenticate, requireRole('portaria', 'organizador'), useTicket)

export default router
