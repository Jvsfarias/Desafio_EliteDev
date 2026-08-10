import { createEvent, listMovieEvents } from '../services/event.service.js'

export async function create(req, res) {
  try {
    const event = await createEvent(req.body, req.user)
    return res.status(201).json(event)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    console.error(error)
    return res.status(500).json({ message: 'Erro ao criar evento.' })
  }
}

export async function listMovies(req, res) {
  try {
    const movies = await listMovieEvents()
    return res.status(200).json(movies)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao listar filmes.' })
  }
}
