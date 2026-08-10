const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function parseError(response, fallbackMessage) {
  try {
    const data = await response.json()
    return data.message || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export const eventService = {
  async listMovies() {
    const response = await fetch(`${API_URL}/events/movies`)

    if (!response.ok) {
      throw new Error(await parseError(response, 'Não foi possível carregar os filmes.'))
    }

    return response.json()
  },

  async create(payload, token) {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(await parseError(response, 'Não foi possível criar o evento.'))
    }

    return response.json()
  },
}
