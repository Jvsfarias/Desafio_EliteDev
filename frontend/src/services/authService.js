const STORAGE_KEY = 'elitedev_auth'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

async function parseError(response, fallbackMessage) {
  try {
    const data = await response.json()
    return data.message || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

async function request(path, body, fallbackError) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await parseError(response, fallbackError))
  }

  return response.json()
}

export const authService = {
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Informe e-mail e senha.')
    }

    return request('/auth/login', { email, password }, 'Não foi possível entrar.')
  },

  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error('Preencha todos os campos.')
    }

    return request(
      '/auth/register',
      { name, email, password },
      'Não foi possível criar a conta.',
    )
  },
}

export { readStorage, writeStorage, clearStorage, STORAGE_KEY }
