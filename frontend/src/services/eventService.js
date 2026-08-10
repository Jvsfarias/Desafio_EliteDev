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
}
