import { api, getApiErrorMessage } from './api'

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

  async listShows(token) {
    try {
      const { data } = await api.get('/catalog/shows', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar os shows.'),
      )
    }
  },
}
