import { api, getApiErrorMessage } from './api'

export const logService = {
  async list(token, { page = 1, limit = 20, action = 'all' } = {}) {
    try {
      const { data } = await api.get('/logs', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          ...(action && action !== 'all' ? { action } : {}),
        },
      })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erro ao carregar logs.'))
    }
  },
}
