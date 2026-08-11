import ActivityLog from '../models/ActivityLog.js'
import User from '../models/User.js'

function toPublicLog(log) {
  return {
    id: log._id.toString(),
    action: log.action,
    actorUserId: log.actorUserId ? log.actorUserId.toString() : null,
    actorName: log.actorName,
    actorEmail: log.actorEmail,
    eventId: log.eventId ? log.eventId.toString() : null,
    eventTitle: log.eventTitle,
    eventType: log.eventType,
    ticketCode: log.ticketCode,
    totalPrice: log.totalPrice,
    details: log.details || {},
    message: log.message,
    createdAt: log.createdAt,
  }
}

async function resolveActor(userId) {
  if (!userId) {
    return {
      actorUserId: null,
      actorName: 'Sistema',
      actorEmail: '',
    }
  }

  const user = await User.findById(userId).select('name email')
  return {
    actorUserId: userId,
    actorName: user?.name || 'Cliente',
    actorEmail: user?.email || '',
  }
}

export async function createActivityLog(payload) {
  const actor = await resolveActor(payload.actorUserId)

  const log = await ActivityLog.create({
    action: payload.action,
    ...actor,
    eventId: payload.eventId || null,
    eventTitle: payload.eventTitle || '',
    eventType: payload.eventType || '',
    ticketCode: payload.ticketCode || '',
    totalPrice: payload.totalPrice || 0,
    details: payload.details || {},
    message: payload.message,
  })

  return toPublicLog(log)
}

export async function listActivityLogs({
  page = 1,
  limit = 20,
  action = null,
} = {}) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const skip = (safePage - 1) * safeLimit

  const filter = {}
  if (action && action !== 'all') {
    filter.action = action
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    ActivityLog.countDocuments(filter),
  ])

  const totalPages = Math.max(Math.ceil(total / safeLimit), 1)

  return {
    items: logs.map(toPublicLog),
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    hasMore: safePage < totalPages,
  }
}

export async function logPurchase({
  actorUserId,
  event,
  ticketCode,
  totalPrice,
  details,
}) {
  const isCinema = event.type === 'filme'
  const detailParts = isCinema
    ? [
        `sessão ${details.sessionDate || ''} ${details.sessionTime || ''}`.trim(),
        `assentos ${(details.seats || []).join(', ')}`,
      ]
    : [
        `área ${details.areaLabel || details.areaKey || ''}`,
        `${details.quantity || 0} ingresso(s)`,
      ]

  return createActivityLog({
    action: 'purchase',
    actorUserId,
    eventId: event._id,
    eventTitle: event.title,
    eventType: event.type,
    ticketCode,
    totalPrice,
    details,
    message: `Compra de ingresso para "${event.title}" (${detailParts.join(' · ')})`,
  })
}

export async function logCancellation({
  actorUserId,
  ticket,
}) {
  const isCinema = ticket.seats?.length > 0
  const details = isCinema
    ? {
        sessionDate: ticket.sessionDate,
        sessionTime: ticket.sessionTime,
        seats: ticket.seats,
      }
    : {
        areaKey: ticket.areaKey,
        areaLabel: ticket.areaLabel,
        quantity: ticket.quantity,
      }

  const detailParts = isCinema
    ? [
        `sessão ${ticket.sessionDate || ''} ${ticket.sessionTime || ''}`.trim(),
        `assentos ${(ticket.seats || []).join(', ')}`,
      ]
    : [
        `área ${ticket.areaLabel || ticket.areaKey || ''}`,
        `${ticket.quantity || 0} ingresso(s)`,
      ]

  return createActivityLog({
    action: 'cancellation',
    actorUserId,
    eventId: ticket.eventId,
    eventTitle: ticket.eventTitle,
    eventType: isCinema ? 'filme' : 'show',
    ticketCode: ticket.code,
    totalPrice: ticket.totalPrice,
    details,
    message: `Cancelamento do ingresso ${ticket.code} de "${ticket.eventTitle}" (${detailParts.join(' · ')})`,
  })
}

export async function logAutoRemoval({
  eventId,
  eventTitle,
  eventType,
  details,
  message,
}) {
  return createActivityLog({
    action: 'auto_removal',
    actorUserId: null,
    eventId,
    eventTitle,
    eventType,
    details,
    message,
  })
}

export async function logEventCancel({
  actorUserId,
  event,
  refundedTickets,
  refundedTotal,
  ticketCodes = [],
}) {
  return createActivityLog({
    action: 'event_cancel',
    actorUserId,
    eventId: event._id,
    eventTitle: event.title,
    eventType: event.type,
    totalPrice: refundedTotal,
    details: {
      refundedTickets,
      refundedTotal,
      ticketCodes,
      venue: event.venue,
    },
    message: `Evento "${event.title}" cancelado pelo organizador. ${refundedTickets} ingresso(s) reembolsado(s).`,
  })
}

export async function logTicketValidation({
  actorUserId,
  ticket,
}) {
  const isCinema = ticket.seats?.length > 0
  const details = isCinema
    ? {
        sessionDate: ticket.sessionDate,
        sessionTime: ticket.sessionTime,
        seats: ticket.seats,
        venue: ticket.eventVenue,
      }
    : {
        areaKey: ticket.areaKey,
        areaLabel: ticket.areaLabel,
        quantity: ticket.quantity,
        venue: ticket.eventVenue,
        showDate: ticket.eventDate,
        showTime: ticket.eventTime,
      }

  const detailParts = isCinema
    ? [
        `sessão ${ticket.sessionDate || ''} ${ticket.sessionTime || ''}`.trim(),
        `assentos ${(ticket.seats || []).join(', ')}`,
      ]
    : [
        `área ${ticket.areaLabel || ticket.areaKey || ''}`,
        `${ticket.quantity || 0} ingresso(s)`,
      ]

  return createActivityLog({
    action: 'ticket_validation',
    actorUserId,
    eventId: ticket.eventId,
    eventTitle: ticket.eventTitle,
    eventType: isCinema ? 'filme' : 'show',
    ticketCode: ticket.code,
    totalPrice: ticket.totalPrice,
    details,
    message: `Ingresso ${ticket.code} validado na portaria para "${ticket.eventTitle}" (${detailParts.join(' · ')})`,
  })
}
