import { listActivityLogs } from '../services/log.service.js'

export async function listLogs(req, res) {
  try {
    const logs = await listActivityLogs({ limit: req.query.limit })
    return res.status(200).json(logs)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao listar logs.' })
  }
}
