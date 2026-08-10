import { api, getApiErrorMessage } from './api'

export const bookingService = {
  async getEvent(id) {
    try {
      const { data } = await api.get(`/events/${id}`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Evento não encontrado.'))
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

  async getAreas(eventId) {
    try {
      const { data } = await api.get(`/events/${eventId}/areas`)
      return data.areas
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erro ao carregar áreas.'))
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

  async bookShow({ eventId, areaKey, quantity, token }) {
    try {
      const { data } = await api.post(
        `/events/${eventId}/book`,
        { areaKey, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Não foi possível realizar a compra.'))
    }
  },
}
