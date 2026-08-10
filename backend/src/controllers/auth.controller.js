import { loginUser, registerUser } from '../services/auth.service.js'

function handleAuthError(res, error, fallbackMessage) {
  if (error.status) {
    return res.status(error.status).json({ message: error.message })
  }

  console.error(error)
  return res.status(500).json({ message: fallbackMessage })
}

export async function register(req, res) {
  try {
    const data = await registerUser(req.body)
    return res.status(201).json(data)
  } catch (error) {
    return handleAuthError(res, error, 'Erro ao criar conta.')
  }
}

export async function login(req, res) {
  try {
    const data = await loginUser(req.body)
    return res.status(200).json(data)
  } catch (error) {
    return handleAuthError(res, error, 'Erro ao entrar.')
  }
}
