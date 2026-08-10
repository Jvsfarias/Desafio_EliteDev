import {
  createEvent,
  getMovieEvent,
  listMovieEvents,
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

export async function getMovie(req, res) {
  try {
    const event = await getMovieEvent(req.params.id)
    return res.status(200).json(event)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar filme.' })
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
