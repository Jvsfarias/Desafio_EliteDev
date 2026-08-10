import bcrypt from 'bcryptjs'
import User from '../models/User.js'

function getDefaultUsers() {
  return [
    {
      name: 'Organizador',
      email: process.env.SEED_ORGANIZADOR_EMAIL,
      password: process.env.SEED_ORGANIZADOR_PASSWORD,
      role: 'organizador',
    },
    {
      name: 'Portaria',
      email: process.env.SEED_PORTARIA_EMAIL,
      password: process.env.SEED_PORTARIA_PASSWORD,
      role: 'portaria',
    },
  ]
}

export async function seedDefaultUsers() {
  const defaultUsers = getDefaultUsers()

  for (const user of defaultUsers) {
    if (!user.email || !user.password) {
      console.warn(`Seed ignorado para role ${user.role}: variáveis de ambiente ausentes`)
      continue
    }

    const exists = await User.findOne({ email: user.email })

    if (exists) {
      continue
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    await User.create({
      ...user,
      password: hashedPassword,
    })

    console.log(`Usuário default criado: ${user.email} (${user.role})`)
  }
}
