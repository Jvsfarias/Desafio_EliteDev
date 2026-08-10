const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const SHOW_CATALOG = [
  {
    id: 'show-1',
    title: 'Festival de Jazz no Parque',
    type: 'show',
    image:
      'https://images.unsplash.com/photo-1514320291840-3095421d4596?w=600&h=400&fit=crop',
  },
  {
    id: 'show-2',
    title: 'Rock na Praça',
    type: 'show',
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf529eec07?w=600&h=400&fit=crop',
  },
]

async function parseError(response, fallbackMessage) {
  try {
    const data = await response.json()
    return data.message || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export const catalogService = {
  async listMovies(token) {
    const response = await fetch(`${API_URL}/catalog/movies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(await parseError(response, 'Não foi possível carregar os filmes.'))
    }

    return response.json()
  },

  async listCatalog(token) {
    const movies = await this.listMovies(token)
    return [...movies, ...SHOW_CATALOG]
  },
}
