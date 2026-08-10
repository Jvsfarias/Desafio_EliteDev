import {
  bookSeats,
  bookShowArea,
  getAreaAvailability,
  getTakenSeats,
} from '../services/booking.service.js'
import Event from '../models/Event.js'

export async function getSeats(req, res) {
  try {
    const { id } = req.params
    const { date, time } = req.query

    if (!date || !time) {
      return res.status(400).json({ message: 'Informe date e time.' })
    }

    const taken = await getTakenSeats(id, date, time)
    return res.status(200).json({ taken })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar assentos.' })
  }
}

export async function getAreas(req, res) {
  try {
    const areas = await getAreaAvailability(req.params.id)
    return res.status(200).json({ areas })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar áreas.' })
  }
}

export async function book(req, res) {
  try {
    const { id: eventId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado.' })
    }

    if (event.type === 'show') {
      const { areaKey, quantity } = req.body
      const result = await bookShowArea({
        eventId,
        areaKey,
        quantity,
        userId,
        userRole,
      })
      return res.status(201).json(result)
    }

    const { sessionDate, sessionTime, seats } = req.body
    const result = await bookSeats({
      eventId,
      sessionDate,
      sessionTime,
      seats,
      userId,
      userRole,
    })
    return res.status(201).json(result)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao realizar reserva.' })
  }
}
