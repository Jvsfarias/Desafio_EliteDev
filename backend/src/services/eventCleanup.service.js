import Event from '../models/Event.js'
import { logAutoRemoval } from './log.service.js'

const TIMEZONE = 'America/Sao_Paulo'

export function getNowComparable() {
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())

  // "2026-08-10 21:49" -> "2026-08-10T21:49"
  return formatted.replace(' ', 'T').slice(0, 16)
}

export function toComparable(date, time = '00:00') {
  const safeDate = String(date || '').trim()
  const safeTime = String(time || '00:00').trim().slice(0, 5)
  return `${safeDate}T${safeTime}`
}

export function isDateTimePast(date, time, now = getNowComparable()) {
  if (!date || !time) return false
  return toComparable(date, time) <= now
}

function pruneMovieSessions(sessions = [], now = getNowComparable()) {
  const remaining = []
  const removed = []

  for (const session of sessions) {
    const date = session.date
    const futureTimes = []

    for (const time of session.times || []) {
      if (isDateTimePast(date, time, now)) {
        removed.push({ date, time })
      } else {
        futureTimes.push(time)
      }
    }

    if (futureTimes.length > 0) {
      remaining.push({ date, times: futureTimes })
    }
  }

  return { remaining, removed }
}

async function removeExpiredShows(now) {
  const shows = await Event.find({ type: 'show' })
  let removedCount = 0

  for (const show of shows) {
    if (!isDateTimePast(show.showDate, show.showTime, now)) continue

    const snapshot = {
      id: show._id.toString(),
      title: show.title,
      type: show.type,
      showDate: show.showDate,
      showTime: show.showTime,
      venue: show.venue,
    }

    await Event.findByIdAndDelete(show._id)
    await logAutoRemoval({
      eventId: snapshot.id,
      eventTitle: snapshot.title,
      eventType: 'show',
      details: {
        showDate: snapshot.showDate,
        showTime: snapshot.showTime,
        venue: snapshot.venue,
        reason: 'Data e horário do show expirados',
      },
      message: `Remoção automática do show "${snapshot.title}" (${snapshot.showDate} · ${snapshot.showTime})`,
    })
    removedCount += 1
  }

  return removedCount
}

async function cleanupMovies(now) {
  const movies = await Event.find({ type: 'filme' })
  let removedCount = 0
  let updatedCount = 0

  for (const movie of movies) {
    const { remaining, removed } = pruneMovieSessions(movie.sessions || [], now)

    if (removed.length === 0) continue

    if (remaining.length === 0) {
      const snapshot = {
        id: movie._id.toString(),
        title: movie.title,
        venue: movie.venue,
        removedSessions: removed,
      }

      await Event.findByIdAndDelete(movie._id)
      await logAutoRemoval({
        eventId: snapshot.id,
        eventTitle: snapshot.title,
        eventType: 'filme',
        details: {
          venue: snapshot.venue,
          removedSessions: snapshot.removedSessions,
          reason: 'Todas as sessões expiraram',
        },
        message: `Remoção automática do filme "${snapshot.title}" (todas as sessões expiraram)`,
      })
      removedCount += 1
      continue
    }

    movie.sessions = remaining
    await movie.save()
    updatedCount += 1

    await logAutoRemoval({
      eventId: movie._id,
      eventTitle: movie.title,
      eventType: 'filme',
      details: {
        venue: movie.venue,
        removedSessions: removed,
        remainingSessions: remaining,
        reason: 'Sessões expiradas removidas',
      },
      message: `Limpeza automática do filme "${movie.title}" (${removed.length} sessão(ões) expirada(s) removida(s))`,
    })
  }

  return { removedCount, updatedCount }
}

export async function cleanupExpiredEvents() {
  const now = getNowComparable()
  const showsRemoved = await removeExpiredShows(now)
  const movies = await cleanupMovies(now)

  return {
    now,
    showsRemoved,
    moviesRemoved: movies.removedCount,
    moviesUpdated: movies.updatedCount,
  }
}

export async function ensureEventIsActive(event) {
  if (!event) return null

  const now = getNowComparable()

  if (event.type === 'show') {
    if (isDateTimePast(event.showDate, event.showTime, now)) {
      const snapshot = {
        id: event._id.toString(),
        title: event.title,
        showDate: event.showDate,
        showTime: event.showTime,
        venue: event.venue,
      }
      await Event.findByIdAndDelete(event._id)
      await logAutoRemoval({
        eventId: snapshot.id,
        eventTitle: snapshot.title,
        eventType: 'show',
        details: {
          showDate: snapshot.showDate,
          showTime: snapshot.showTime,
          venue: snapshot.venue,
          reason: 'Data e horário do show expirados',
        },
        message: `Remoção automática do show "${snapshot.title}" (${snapshot.showDate} · ${snapshot.showTime})`,
      })
      return null
    }
    return event
  }

  if (event.type === 'filme') {
    const { remaining, removed } = pruneMovieSessions(event.sessions || [], now)

    if (removed.length === 0) return event

    if (remaining.length === 0) {
      const snapshot = {
        id: event._id.toString(),
        title: event.title,
        venue: event.venue,
        removedSessions: removed,
      }
      await Event.findByIdAndDelete(event._id)
      await logAutoRemoval({
        eventId: snapshot.id,
        eventTitle: snapshot.title,
        eventType: 'filme',
        details: {
          venue: snapshot.venue,
          removedSessions: snapshot.removedSessions,
          reason: 'Todas as sessões expiraram',
        },
        message: `Remoção automática do filme "${snapshot.title}" (todas as sessões expiraram)`,
      })
      return null
    }

    event.sessions = remaining
    await event.save()
    await logAutoRemoval({
      eventId: event._id,
      eventTitle: event.title,
      eventType: 'filme',
      details: {
        venue: event.venue,
        removedSessions: removed,
        remainingSessions: remaining,
        reason: 'Sessões expiradas removidas',
      },
      message: `Limpeza automática do filme "${event.title}" (${removed.length} sessão(ões) expirada(s) removida(s))`,
    })
    return event
  }

  return event
}
