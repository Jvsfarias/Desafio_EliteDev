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
    description: event.description || '',
    rating: event.rating || '',
    movieDetails: event.movieDetails || null,
    venue: event.venue,
    price: event.price,
    seatMap: event.seatMap,
    sessions: event.sessions,
    showDate: event.showDate || '',
    showTime: event.showTime || '',
    areas: event.areas || [],
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

  if (type !== 'filme' && type !== 'show') {
    throw createHttpError('Tipo de evento inválido.', 400)
  }

  if (type === 'show') {
    return createShowEvent(payload, organizer)
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

async function createShowEvent(payload, organizer) {
  const { catalogItemId, title, image, description, venue, showDate, showTime, areas } = payload

  if (!showDate || !DATE_PATTERN.test(showDate)) {
    throw createHttpError('Informe uma data válida para o show.', 400)
  }

  if (!showTime || !TIME_PATTERN.test(showTime)) {
    throw createHttpError('Informe um horário válido para o show.', 400)
  }

  if (!Array.isArray(areas) || areas.length === 0) {
    throw createHttpError('Defina ao menos uma área com capacidade e preço.', 400)
  }

  const normalizedAreas = areas.map((area, i) => {
    const capacity = Number(area.capacity)
    const price = Number(area.price)

    if (!area.key || !area.label) {
      throw createHttpError(`Área ${i + 1} inválida.`, 400)
    }
    if (!Number.isFinite(capacity) || capacity < 0) {
      throw createHttpError(`Capacidade inválida na área "${area.label}".`, 400)
    }
    if (!Number.isFinite(price) || price < 0) {
      throw createHttpError(`Preço inválido na área "${area.label}".`, 400)
    }

    return { key: String(area.key), label: String(area.label), capacity, price }
  })

  const capacity = normalizedAreas.reduce((sum, a) => sum + a.capacity, 0)

  const event = await Event.create({
    catalogItemId: String(catalogItemId).trim(),
    title: String(title).trim(),
    type: 'show',
    image: image ? String(image).trim() : '',
    description: description ? String(description).trim() : '',
    venue: String(venue).trim(),
    showDate,
    showTime,
    areas: normalizedAreas,
    price: 0,
    capacity,
    createdBy: organizer._id,
  })

  return toPublicEvent(event)
}

export async function listMovieEvents() {
  const events = await Event.find({ type: 'filme' }).sort({ createdAt: -1 })
  return events.map(toPublicEvent)
}

export async function listShowEvents() {
  const events = await Event.find({ type: 'show' }).sort({ createdAt: -1 })
  return events.map(toPublicEvent)
}

export async function getMovieEvent(id) {
  const event = await Event.findById(id)

  if (!event || event.type !== 'filme') {
    const error = new Error('Filme não encontrado.')
    error.status = 404
    throw error
  }

  return toPublicEvent(event)
}

export async function updateEvent(id, payload) {
  const event = await Event.findById(id)

  if (!event || event.type !== 'filme') {
    throw createHttpError('Filme não encontrado.', 404)
  }

  const { rating, venue, price, sessions } = payload

  if (!venue) {
    throw createHttpError('Informe o local / sala.', 400)
  }

  const parsedPrice = Number(price)

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw createHttpError('Preço inválido.', 400)
  }

  const normalizedSessions = normalizeCinemaSessions(sessions)

  event.rating = rating ? String(rating).trim() : ''
  event.venue = String(venue).trim()
  event.price = parsedPrice
  event.sessions = normalizedSessions

  await event.save()

  return toPublicEvent(event)
}
