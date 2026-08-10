import { listPopularMovies } from '../services/catalog.service.js'

export async function listMovies(req, res) {
  try {
    const movies = await listPopularMovies()
    return res.status(200).json(movies)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    console.error(error)
    return res.status(500).json({ message: 'Erro ao carregar catálogo de filmes.' })
  }
}
