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

export async function updateProfile(userId, payload) {
  const { name, email, currentPassword, newPassword } = payload

  if (!name || !email) {
    throw createHttpError('Informe nome e e-mail.', 400)
  }

  const user = await User.findById(userId)

  if (!user) {
    throw createHttpError('Usuário não encontrado.', 404)
  }

  const normalizedEmail = email.toLowerCase().trim()
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw createHttpError('Informe um nome válido.', 400)
  }

  if (normalizedEmail !== user.email) {
    const emailExists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    })

    if (emailExists) {
      throw createHttpError('E-mail já cadastrado.', 409)
    }
  }

  if (newPassword) {
    if (!currentPassword) {
      throw createHttpError('Informe a senha atual para alterar a senha.', 400)
    }

    if (newPassword.length < 6) {
      throw createHttpError('A nova senha deve ter pelo menos 6 caracteres.', 400)
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      throw createHttpError('Senha atual incorreta.', 401)
    }

    user.password = await bcrypt.hash(newPassword, 10)
  }

  user.name = trimmedName
  user.email = normalizedEmail
  await user.save()

  return {
    token: createToken(user),
    user: toPublicUser(user),
  }
}
