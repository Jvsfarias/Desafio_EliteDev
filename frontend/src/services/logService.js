import { api, getApiErrorMessage } from './api'

export const logService = {
  async list(token) {
    try {
      const { data } = await api.get('/logs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erro ao carregar logs.'))
    }
  },
}
