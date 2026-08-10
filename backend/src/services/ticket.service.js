import Ticket from '../models/Ticket.js'

function createHttpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function toPublicTicket(ticket) {
  return {
    code: ticket.code,
    eventId: ticket.eventId.toString(),
    eventTitle: ticket.eventTitle,
    eventVenue: ticket.eventVenue,
    eventDate: ticket.eventDate,
    eventTime: ticket.eventTime,
    seats: ticket.seats,
    sessionDate: ticket.sessionDate,
    sessionTime: ticket.sessionTime,
    areaKey: ticket.areaKey,
    areaLabel: ticket.areaLabel,
    quantity: ticket.quantity,
    totalPrice: ticket.totalPrice,
    status: ticket.status,
    usedAt: ticket.usedAt,
    createdAt: ticket.createdAt,
  }
}

export async function createTicket(data) {
  const ticket = await Ticket.create(data)
  return toPublicTicket(ticket)
}

export async function getTicketByCode(code) {
  const ticket = await Ticket.findOne({ code: code.toUpperCase() })

  if (!ticket) {
    throw createHttpError('Ingresso não encontrado.', 404)
  }

  return toPublicTicket(ticket)
}

export async function validateTicket(code, eventId) {
  const ticket = await Ticket.findOne({ code: code.toUpperCase() })

  if (!ticket) {
    return { valid: false, reason: 'invalid', message: 'Ingresso não encontrado.' }
  }

  if (eventId && ticket.eventId.toString() !== String(eventId)) {
    return {
      valid: false,
      reason: 'wrong_event',
      message: 'Ingresso pertence a outro evento.',
      ticket: toPublicTicket(ticket),
    }
  }

  if (ticket.status === 'used') {
    return {
      valid: false,
      reason: 'used',
      message: 'Ingresso já utilizado.',
      usedAt: ticket.usedAt,
      ticket: toPublicTicket(ticket),
    }
  }

  ticket.status = 'used'
  ticket.usedAt = new Date()
  await ticket.save()

  return {
    valid: true,
    reason: 'valid',
    message: 'Ingresso válido. Entrada liberada!',
    ticket: toPublicTicket(ticket),
  }
}

export async function peekTicket(code) {
  const ticket = await Ticket.findOne({ code: code.toUpperCase() })

  if (!ticket) {
    return { valid: false, reason: 'invalid', message: 'Ingresso não encontrado.' }
  }

  if (ticket.status === 'used') {
    return {
      valid: false,
      reason: 'used',
      message: 'Ingresso já utilizado.',
      usedAt: ticket.usedAt,
      ticket: toPublicTicket(ticket),
    }
  }

  return {
    valid: true,
    reason: 'valid',
    message: 'Ingresso válido.',
    ticket: toPublicTicket(ticket),
  }
}
