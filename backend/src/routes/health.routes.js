import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'

  res.json({
    status: 'ok',
    database: dbState,
    timestamp: new Date().toISOString(),
  })
})

export default router
