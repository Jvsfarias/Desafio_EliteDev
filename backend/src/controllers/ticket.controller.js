import { getTicketByCode, peekTicket, validateTicket } from '../services/ticket.service.js'

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
