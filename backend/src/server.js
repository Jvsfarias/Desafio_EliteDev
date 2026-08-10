import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'
import { seedDefaultUsers } from './config/seed.js'

const PORT = process.env.PORT || 3000
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://elitedev:elitedev123@localhost:27017/elitedev?authSource=admin'

async function start() {
  try {
    await connectDB(MONGODB_URI)
    await seedDefaultUsers()
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error.message)
    process.exit(1)
  }
}

start()
