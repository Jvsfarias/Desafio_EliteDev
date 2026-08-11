import { api, getApiErrorMessage } from './api'

export const eventService = {
  async listMovies() {
    try {
      const { data } = await api.get('/events/movies')
      return data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar os filmes.'),
      )
    }
  },

  async listShows() {
    try {
      const { data } = await api.get('/events/shows')
      return data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar os shows.'),
      )
    }
  },

  async search(q, { limit = 20 } = {}) {
    try {
      const { data } = await api.get('/events/search', {
        params: { q, limit },
      })
      return data.items || []
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível buscar eventos.'),
      )
    }
  },

  async create(payload, token) {
    try {
      const { data } = await api.post('/events', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível criar o evento.'),
      )
    }
  },

  async update(id, payload, token) {
    try {
      const { data } = await api.put(`/events/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível atualizar o evento.'),
      )
    }
  },

  async cancel(id, token) {
    try {
      const { data } = await api.post(
        `/events/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível cancelar o evento.'),
      )
    }
  },
}
