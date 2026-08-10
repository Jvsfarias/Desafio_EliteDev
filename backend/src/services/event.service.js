import Event from '../models/Event.js'

const CINEMA_SEAT_MAP = Object.freeze({ rows: 8, cols: 12 })
const TIME_PATTERN = /^\d{2}:\d{2}$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function createHttpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function buildMovieDetails(payload = {}) {
  const tmdbId = Number(payload.catalogItemId || payload.tmdbId)

  return {
    tmdbId: Number.isFinite(tmdbId) ? tmdbId : undefined,
    originalTitle: payload.originalTitle ? String(payload.originalTitle).trim() : '',
    overview: payload.overview ? String(payload.overview).trim() : '',
    backdrop: payload.backdrop ? String(payload.backdrop).trim() : '',
    releaseDate: payload.releaseDate ? String(payload.releaseDate).trim() : '',
    voteAverage: Number(payload.voteAverage) || 0,
    voteCount: Number(payload.voteCount) || 0,
    popularity: Number(payload.popularity) || 0,
    originalLanguage: payload.originalLanguage
      ? String(payload.originalLanguage).trim()
      : '',
    genreIds: Array.isArray(payload.genreIds)
      ? payload.genreIds.map(Number).filter(Number.isFinite)
      : [],
    genres: Array.isArray(payload.genres)
      ? payload.genres.map((genre) => String(genre).trim()).filter(Boolean)
      : [],
    adult: Boolean(payload.adult),
  }
}

function toPublicEvent(event) {
  return {
    id: event._id.toString(),
    catalogItemId: event.catalogItemId,
    title: event.title,
    type: event.type,
    image: event.image,
    rating: event.rating || '',
    movieDetails: event.movieDetails || null,
    venue: event.venue,
    price: event.price,
    seatMap: event.seatMap,
    sessions: event.sessions,
    capacity: event.capacity,
    createdBy: event.createdBy.toString(),
  }
}

function normalizeCinemaSessions(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    throw createHttpError('Adicione ao menos uma sessão com data e horário.', 400)
  }

  return sessions.map((session, index) => {
    const date = String(session?.date || '').trim()
    const times = Array.isArray(session?.times)
      ? session.times.map((time) => String(time).trim()).filter(Boolean)
      : []

    if (!DATE_PATTERN.test(date)) {
      throw createHttpError(`Data inválida na sessão ${index + 1}.`, 400)
    }

    if (times.length === 0) {
      throw createHttpError(`Informe ao menos um horário na sessão ${index + 1}.`, 400)
    }

    for (const time of times) {
      if (!TIME_PATTERN.test(time)) {
        throw createHttpError(`Horário inválido na sessão ${index + 1}.`, 400)
      }
    }

    return { date, times: [...new Set(times)] }
  })
}

export async function createEvent(payload, organizer) {
  const {
    catalogItemId,
    title,
    type,
    image,
    rating,
    venue,
    price,
    sessions,
    originalTitle,
    overview,
    backdrop,
    releaseDate,
    voteAverage,
    voteCount,
    popularity,
    originalLanguage,
    genreIds,
    genres,
    adult,
  } = payload

  if (!catalogItemId || !title || !type || !venue) {
    throw createHttpError('Preencha todos os campos obrigatórios.', 400)
  }

  if (type === 'show') {
    throw createHttpError('Cadastro de shows ainda não está disponível.', 400)
  }

  if (type !== 'filme') {
    throw createHttpError('Tipo de evento inválido.', 400)
  }

  const parsedPrice = Number(price)

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw createHttpError('Preço inválido.', 400)
  }

  const normalizedSessions = normalizeCinemaSessions(sessions)
  const capacity = CINEMA_SEAT_MAP.rows * CINEMA_SEAT_MAP.cols
  const movieDetails = buildMovieDetails({
    catalogItemId,
    originalTitle,
    overview,
    backdrop,
    releaseDate,
    voteAverage,
    voteCount,
    popularity,
    originalLanguage,
    genreIds,
    genres,
    adult,
  })

  const event = await Event.create({
    catalogItemId: String(catalogItemId).trim(),
    title: String(title).trim(),
    type: 'filme',
    image: image ? String(image).trim() : '',
    rating: rating ? String(rating).trim() : '',
    movieDetails,
    venue: String(venue).trim(),
    price: parsedPrice,
    seatMap: CINEMA_SEAT_MAP,
    sessions: normalizedSessions,
    capacity,
    createdBy: organizer._id,
  })

  return toPublicEvent(event)
}

export async function listMovieEvents() {
  const events = await Event.find({ type: 'filme' }).sort({ createdAt: -1 })
  return events.map(toPublicEvent)
}
