import { api, getApiErrorMessage } from './api'

export const bookingService = {
  async getEvent(id) {
    try {
      const { data } = await api.get(`/events/${id}`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Filme não encontrado.'))
    }
  },

  async getTakenSeats(eventId, date, time) {
    try {
      const { data } = await api.get(`/events/${eventId}/seats`, {
        params: { date, time },
      })
      return data.taken
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erro ao carregar assentos.'))
    }
  },

  async book({ eventId, sessionDate, sessionTime, seats, token }) {
    try {
      const { data } = await api.post(
        `/events/${eventId}/book`,
        { sessionDate, sessionTime, seats },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Não foi possível realizar a compra.'))
    }
  },
}
