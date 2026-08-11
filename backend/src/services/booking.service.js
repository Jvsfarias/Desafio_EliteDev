import Booking from '../models/Booking.js'
import Event from '../models/Event.js'
import { logPurchase } from './log.service.js'
import { createTicket } from './ticket.service.js'

function createHttpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

export async function getTakenSeats(eventId, sessionDate, sessionTime) {
  const bookings = await Booking.find({ eventId, sessionDate, sessionTime })
  const taken = bookings.flatMap((b) => b.seats)
  return [...new Set(taken)]
}

export async function getAreaAvailability(eventId) {
  const event = await Event.findById(eventId)

  if (!event || event.type !== 'show') {
    throw createHttpError('Show não encontrado.', 404)
  }

  const bookings = await Booking.find({
    eventId,
    areaKey: { $ne: '' },
  })

  const soldByArea = {}
  for (const booking of bookings) {
    soldByArea[booking.areaKey] = (soldByArea[booking.areaKey] || 0) + booking.quantity
  }

  return (event.areas || []).map((area) => {
    const sold = soldByArea[area.key] || 0
    const remaining = Math.max(area.capacity - sold, 0)

    return {
      key: area.key,
      label: area.label,
      capacity: area.capacity,
      sold,
      remaining,
      price: area.price,
    }
  })
}

export async function bookSeats({ eventId, sessionDate, sessionTime, seats, userId, userRole }) {
  if (userRole === 'organizador') {
    throw createHttpError('Organizadores não podem comprar ingressos.', 403)
  }

  const event = await Event.findById(eventId)

  if (!event) {
    throw createHttpError('Evento não encontrado.', 404)
  }

  if (event.type !== 'filme') {
    throw createHttpError('Reserva de assentos disponível apenas para filmes.', 400)
  }

  const session = event.sessions.find((s) => s.date === sessionDate)

  if (!session || !session.times.includes(sessionTime)) {
    throw createHttpError('Sessão ou horário não encontrado.', 404)
  }

  if (!Array.isArray(seats) || seats.length === 0) {
    throw createHttpError('Selecione ao menos um assento.', 400)
  }

  const { rows, cols } = event.seatMap
  const validSeat = /^[A-Z]\d{1,2}$/
  for (const seat of seats) {
    if (!validSeat.test(seat)) {
      throw createHttpError(`Assento inválido: ${seat}.`, 400)
    }
    const rowIdx = seat.charCodeAt(0) - 65
    const colIdx = parseInt(seat.slice(1), 10) - 1
    if (rowIdx < 0 || rowIdx >= rows || colIdx < 0 || colIdx >= cols) {
      throw createHttpError(`Assento fora do mapa: ${seat}.`, 400)
    }
  }

  const takenSeats = await getTakenSeats(eventId, sessionDate, sessionTime)
  const conflict = seats.filter((s) => takenSeats.includes(s))

  if (conflict.length > 0) {
    throw createHttpError(
      `Assento(s) já reservado(s): ${conflict.join(', ')}.`,
      409
    )
  }

  const totalPrice = event.price * seats.length

  const booking = await Booking.create({
    eventId,
    sessionDate,
    sessionTime,
    seats,
    userId,
    totalPrice,
  })

  const ticket = await createTicket({
    bookingId: booking._id,
    eventId: event._id,
    userId,
    eventTitle: event.title,
    eventVenue: event.venue,
    eventDate: sessionDate,
    eventTime: sessionTime,
    seats,
    sessionDate,
    sessionTime,
    totalPrice,
  })

  await logPurchase({
    actorUserId: userId,
    event,
    ticketCode: ticket.code,
    totalPrice,
    details: {
      sessionDate,
      sessionTime,
      seats,
      venue: event.venue,
    },
  })

  return {
    id: booking._id.toString(),
    eventId: booking.eventId.toString(),
    sessionDate: booking.sessionDate,
    sessionTime: booking.sessionTime,
    seats: booking.seats,
    totalPrice: booking.totalPrice,
    ticketCode: ticket.code,
    createdAt: booking.createdAt,
  }
}

export async function bookShowArea({ eventId, areaKey, quantity, userId, userRole }) {
  if (userRole === 'organizador') {
    throw createHttpError('Organizadores não podem comprar ingressos.', 403)
  }

  const event = await Event.findById(eventId)

  if (!event || event.type !== 'show') {
    throw createHttpError('Show não encontrado.', 404)
  }

  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    throw createHttpError('Informe uma quantidade válida.', 400)
  }

  const area = (event.areas || []).find((item) => item.key === areaKey)
  if (!area) {
    throw createHttpError('Área não encontrada.', 404)
  }

  if (area.capacity <= 0) {
    throw createHttpError('Esta área não está disponível para venda.', 400)
  }

  const availability = await getAreaAvailability(eventId)
  const selected = availability.find((item) => item.key === areaKey)

  if (!selected || selected.remaining < qty) {
    throw createHttpError(
      `Ingressos insuficientes. Disponíveis: ${selected?.remaining ?? 0}.`,
      409
    )
  }

  const totalPrice = area.price * qty

  const booking = await Booking.create({
    eventId,
    areaKey,
    quantity: qty,
    userId,
    totalPrice,
  })

  const ticket = await createTicket({
    bookingId: booking._id,
    eventId: event._id,
    userId,
    eventTitle: event.title,
    eventVenue: event.venue,
    eventDate: event.showDate,
    eventTime: event.showTime,
    areaKey,
    areaLabel: area.label,
    quantity: qty,
    totalPrice,
  })

  await logPurchase({
    actorUserId: userId,
    event,
    ticketCode: ticket.code,
    totalPrice,
    details: {
      areaKey,
      areaLabel: area.label,
      quantity: qty,
      venue: event.venue,
      showDate: event.showDate,
      showTime: event.showTime,
    },
  })

  return {
    id: booking._id.toString(),
    eventId: booking.eventId.toString(),
    areaKey: booking.areaKey,
    quantity: booking.quantity,
    totalPrice: booking.totalPrice,
    remaining: selected.remaining - qty,
    ticketCode: ticket.code,
    createdAt: booking.createdAt,
  }
}
