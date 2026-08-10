import { bookSeats, getTakenSeats } from '../services/booking.service.js'

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

export async function book(req, res) {
  try {
    const { id: eventId } = req.params
    const { sessionDate, sessionTime, seats } = req.body
    const userId = req.user._id

    const result = await bookSeats({ eventId, sessionDate, sessionTime, seats, userId })
    return res.status(201).json(result)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao realizar reserva.' })
  }
}
