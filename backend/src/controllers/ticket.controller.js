import {
  cancelTicket,
  getTicketByCode,
  listTicketsByUser,
  peekTicket,
  validateTicket,
} from '../services/ticket.service.js'

export async function listMine(req, res) {
  try {
    const status = req.query.status || 'active'
    const tickets = await listTicketsByUser(req.user._id, { status })
    return res.status(200).json(tickets)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao listar ingressos.' })
  }
}

export async function getTicket(req, res) {
  try {
    const ticket = await getTicketByCode(req.params.code)
    return res.status(200).json(ticket)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar ingresso.' })
  }
}

export async function cancel(req, res) {
  try {
    const ticket = await cancelTicket(req.params.code, req.user._id)
    return res.status(200).json(ticket)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao cancelar ingresso.' })
  }
}

export async function checkTicket(req, res) {
  try {
    const result = await peekTicket(req.params.code)
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao verificar ingresso.' })
  }
}

export async function useTicket(req, res) {
  try {
    const { eventId } = req.body
    const result = await validateTicket(req.params.code, eventId)
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao validar ingresso.' })
  }
}
