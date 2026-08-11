import Ticket from '../models/Ticket.js'
import Booking from '../models/Booking.js'
import { logCancellation, logTicketValidation } from './log.service.js'

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
    cancelledAt: ticket.cancelledAt,
    createdAt: ticket.createdAt,
  }
}

export async function createTicket(data) {
  const ticket = await Ticket.create(data)
  return toPublicTicket(ticket)
}

export async function listTicketsByUser(userId, { status = 'active' } = {}) {
  const filter = { userId }
  if (status) filter.status = status

  const tickets = await Ticket.find(filter).sort({ createdAt: -1 })
  return tickets.map(toPublicTicket)
}

export async function getTicketByCode(code) {
  const ticket = await Ticket.findOne({ code: code.toUpperCase() })

  if (!ticket) {
    throw createHttpError('Ingresso não encontrado.', 404)
  }

  return toPublicTicket(ticket)
}

export async function cancelTicket(code, userId) {
  const ticket = await Ticket.findOne({ code: code.toUpperCase() })

  if (!ticket) {
    throw createHttpError('Ingresso não encontrado.', 404)
  }

  if (ticket.userId.toString() !== String(userId)) {
    throw createHttpError('Este ingresso não pertence a você.', 403)
  }

  if (ticket.status === 'used') {
    throw createHttpError('Ingresso já utilizado não pode ser cancelado.', 400)
  }

  if (ticket.status === 'cancelled') {
    throw createHttpError('Ingresso já está cancelado.', 400)
  }

  if (ticket.bookingId) {
    await Booking.findByIdAndDelete(ticket.bookingId)
  }

  ticket.status = 'cancelled'
  ticket.cancelledAt = new Date()
  await ticket.save()

  await logCancellation({
    actorUserId: userId,
    ticket,
  })

  return toPublicTicket(ticket)
}

export async function validateTicket(code, eventId, actorUserId = null) {
  const ticket = await Ticket.findOne({ code: code.toUpperCase() })

  if (!ticket) {
    return { valid: false, reason: 'invalid', message: 'Ingresso não encontrado.' }
  }

  if (ticket.status === 'cancelled') {
    return {
      valid: false,
      reason: 'invalid',
      message: 'Ingresso cancelado.',
      ticket: toPublicTicket(ticket),
    }
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

  await logTicketValidation({
    actorUserId,
    ticket,
  })

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

  if (ticket.status === 'cancelled') {
    return {
      valid: false,
      reason: 'invalid',
      message: 'Ingresso cancelado.',
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

  return {
    valid: true,
    reason: 'valid',
    message: 'Ingresso válido.',
    ticket: toPublicTicket(ticket),
  }
}
