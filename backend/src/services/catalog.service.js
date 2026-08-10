import axios from 'axios'

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

  try {
    const { data } = await axios.get(
      'https://api.themoviedb.org/3/movie/popular',
      {
        params: { language: 'pt-BR' },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )

    const results = Array.isArray(data.results) ? data.results : []
    return results.map(mapTmdbMovie)
  } catch (error) {
    throw createHttpError(
      'Falha ao buscar filmes na TMDB.',
      error.response?.status || 500
    )
  }
}

function pickBestImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) return ''

  const preferred =
    images.find((image) => image.ratio === '16_9' && image.width >= 1024) ||
    images.find((image) => image.ratio === '16_9') ||
    images[0]

  return preferred?.url || ''
}

export function mapTicketmasterEvent(event) {
  const attraction = event._embedded?.attractions?.[0]

  return {
    id: String(event.id),
    type: 'show',
    title: attraction?.name || event.name || 'Sem título',
    image: pickBestImage(event.images),
    attractionId: attraction?.id ? String(attraction.id) : '',
  }
}

function normalizeShowTitle(title) {
  return title
    .split(' - ')[0]
    .trim()
    .toLowerCase()
}

function dedupeShows(shows) {
  const seen = new Set()

  return shows.reduce((unique, show) => {
    const key = show.attractionId || normalizeShowTitle(show.title)
    if (!key || seen.has(key)) return unique

    seen.add(key)
    unique.push({
      id: show.id,
      type: show.type,
      title: show.attractionId
        ? show.title
        : show.title.split(' - ')[0].trim() || show.title,
      image: show.image,
    })
    return unique
  }, [])
}

export async function listShows() {
  const apiKey = process.env.TICKETMASTER_API_KEY

  if (!apiKey) {
    throw createHttpError('TICKETMASTER_API_KEY não configurado.', 500)
  }

  try {
    const { data } = await axios.get(
      'https://app.ticketmaster.com/discovery/v2/events.json',
      {
        params: {
          countryCode: 'BR',
          size: 50,
          apikey: apiKey,
        },
      }
    )

    const results = Array.isArray(data._embedded?.events) ? data._embedded.events : []
    return dedupeShows(results.map(mapTicketmasterEvent))
  } catch (error) {
    throw createHttpError(
      'Falha ao buscar shows na Ticketmaster.',
      error.response?.status || 500
    )
  }
}
