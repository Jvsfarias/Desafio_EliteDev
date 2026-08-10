import Booking from '../models/Booking.js'
import Event from '../models/Event.js'

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

export async function bookSeats({ eventId, sessionDate, sessionTime, seats, userId, userRole }) {
  if (userRole === 'organizador') {
    throw createHttpError('Organizadores não podem comprar ingressos.', 403)
  }

  const event = await Event.findById(eventId)

  if (!event) {
    throw createHttpError('Evento não encontrado.', 404)
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

  return {
    id: booking._id.toString(),
    eventId: booking.eventId.toString(),
    sessionDate: booking.sessionDate,
    sessionTime: booking.sessionTime,
    seats: booking.seats,
    totalPrice: booking.totalPrice,
    createdAt: booking.createdAt,
  }
}
