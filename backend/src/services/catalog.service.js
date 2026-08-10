const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

const GENRE_NAMES = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção científica',
  10770: 'Cinema TV',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
}

function createHttpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function buildImageUrl(path, size = 'w500') {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

function mapGenres(genreIds = []) {
  return genreIds
    .map((id) => GENRE_NAMES[id])
    .filter(Boolean)
}

export function mapTmdbMovie(movie) {
  const genreIds = Array.isArray(movie.genre_ids) ? movie.genre_ids : []

  return {
    id: String(movie.id),
    type: 'filme',
    title: movie.title || movie.original_title || 'Sem título',
    originalTitle: movie.original_title || '',
    overview: movie.overview || '',
    image: buildImageUrl(movie.poster_path, 'w500'),
    backdrop: buildImageUrl(movie.backdrop_path, 'w1280'),
    releaseDate: movie.release_date || '',
    voteAverage: Number(movie.vote_average) || 0,
    voteCount: Number(movie.vote_count) || 0,
    popularity: Number(movie.popularity) || 0,
    originalLanguage: movie.original_language || '',
    genreIds,
    genres: mapGenres(genreIds),
    adult: Boolean(movie.adult),
  }
}

export async function listPopularMovies() {
  const token = process.env.TMDB_BEARER_TOKEN

  if (!token) {
    throw createHttpError('TMDB_BEARER_TOKEN não configurado.', 500)
  }

  const response = await fetch(
    'https://api.themoviedb.org/3/movie/popular?language=pt-BR',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw createHttpError('Falha ao buscar filmes na TMDB.', response.status)
  }

  const data = await response.json()
  const results = Array.isArray(data.results) ? data.results : []

  return results.map(mapTmdbMovie)
}
