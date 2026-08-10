import { api, getApiErrorMessage } from './api'

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

export const catalogService = {
  async listMovies(token) {
    try {
      const { data } = await api.get('/catalog/movies', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar os filmes.'),
      )
    }
  },

  async listCatalog(token) {
    const movies = await this.listMovies(token)
    return [...movies, ...SHOW_CATALOG]
  },
}
