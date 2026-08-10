import {
  createEvent,
  getEventById,
  listMovieEvents,
  listShowEvents,
  updateEvent,
} from '../services/event.service.js'

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

export async function listShows(req, res) {
  try {
    const shows = await listShowEvents()
    return res.status(200).json(shows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao listar shows.' })
  }
}

export async function getById(req, res) {
  try {
    const event = await getEventById(req.params.id)
    return res.status(200).json(event)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar evento.' })
  }
}

export async function update(req, res) {
  try {
    const event = await updateEvent(req.params.id, req.body)
    return res.status(200).json(event)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao atualizar evento.' })
  }
}
