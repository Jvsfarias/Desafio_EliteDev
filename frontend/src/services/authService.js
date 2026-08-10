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

/** Mock: resolve role until the real API exists */
function resolveMockRole(email) {
  const value = email.toLowerCase()
  if (value.startsWith('organizador@') || value.includes('+organizador@')) {
    return 'organizador'
  }
  if (value.startsWith('portaria@') || value.includes('+portaria@')) {
    return 'portaria'
  }
  return 'cliente'
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Auth service shaped like the future API.
 * Swap internals for fetch() when the backend is ready.
 */
export const authService = {
  async login({ email, password }) {
    await delay()
    if (!email || !password) {
      throw new Error('Informe e-mail e senha.')
    }

    const role = resolveMockRole(email)
    const name = email.split('@')[0]

    return {
      token: `mock-token-${Date.now()}`,
      user: {
        id: `user-${role}`,
        name,
        email,
        role,
      },
    }
  },

  async register({ name, email, password }) {
    await delay()
    if (!name || !email || !password) {
      throw new Error('Preencha todos os campos.')
    }

    return {
      token: `mock-token-${Date.now()}`,
      user: {
        id: `user-cliente-${Date.now()}`,
        name,
        email,
        role: 'cliente',
      },
    }
  },
}

export { readStorage, writeStorage, clearStorage, STORAGE_KEY }
