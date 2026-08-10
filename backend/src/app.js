import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
  })
})

export default app
