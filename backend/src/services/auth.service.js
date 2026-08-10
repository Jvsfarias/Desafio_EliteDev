import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function createHttpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw createHttpError('Preencha todos os campos.', 400)
  }

  if (password.length < 6) {
    throw createHttpError('A senha deve ter pelo menos 6 caracteres.', 400)
  }

  const normalizedEmail = email.toLowerCase().trim()
  const emailExists = await User.findOne({ email: normalizedEmail })

  if (emailExists) {
    throw createHttpError('E-mail já cadastrado.', 409)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'cliente',
  })

  return {
    token: createToken(user),
    user: toPublicUser(user),
  }
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createHttpError('Informe e-mail e senha.', 400)
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })

  if (!user) {
    throw createHttpError('E-mail ou senha inválidos.', 401)
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    throw createHttpError('E-mail ou senha inválidos.', 401)
  }

  return {
    token: createToken(user),
    user: toPublicUser(user),
  }
}
