import { listActivityLogs } from '../services/log.service.js'

export async function listLogs(req, res) {
  try {
    const result = await listActivityLogs({
      page: req.query.page,
      limit: req.query.limit,
      action: req.query.action,
    })
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao listar logs.' })
  }
}
