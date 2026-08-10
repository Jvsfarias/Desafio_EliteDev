import { api, getApiErrorMessage } from './api'

export const ticketService = {
  async getTicket(code) {
    try {
      const { data } = await api.get(`/tickets/${code}`)
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Ingresso não encontrado.'))
    }
  },

  async useTicket(code, token, eventId) {
    try {
      const { data } = await api.post(
        `/tickets/${code}/use`,
        { eventId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erro ao validar ingresso.'))
    }
  },
}
