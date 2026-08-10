import { api, getApiErrorMessage } from './api'

const STORAGE_KEY = 'elitedev_auth'

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

async function request(path, body, fallbackError) {
  try {
    const { data } = await api.post(path, body)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackError))
  }
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
