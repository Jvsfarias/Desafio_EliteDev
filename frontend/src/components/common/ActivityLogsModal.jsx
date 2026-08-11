import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import { logService } from '../../services/logService'

const PAGE_SIZE = 20

function formatPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''
}

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDetails(log) {
  const details = log.details || {}

  if (log.action === 'auto_removal') {
    return [
      details.reason || null,
      details.showDate || details.showTime
        ? `Horário: ${[details.showDate, details.showTime].filter(Boolean).join(' · ')}`
        : null,
      details.venue ? `Local: ${details.venue}` : null,
      details.removedSessions?.length
        ? `Sessões removidas: ${details.removedSessions
            .map((s) => `${s.date} ${s.time}`)
            .join(', ')}`
        : null,
    ].filter(Boolean)
  }

  if (log.action === 'event_cancel') {
    return [
      details.venue ? `Local: ${details.venue}` : null,
      details.refundedTickets != null
        ? `Ingressos reembolsados: ${details.refundedTickets}`
        : null,
    ].filter(Boolean)
  }

  if (log.eventType === 'filme' || details.seats?.length) {
    return [
      details.sessionDate && details.sessionTime
        ? `Sessão ${details.sessionDate} · ${details.sessionTime}`
        : null,
      details.seats?.length ? `Assentos: ${details.seats.join(', ')}` : null,
      details.venue ? `Local: ${details.venue}` : null,
    ].filter(Boolean)
  }

  return [
    details.areaLabel || details.areaKey
      ? `Área: ${details.areaLabel || details.areaKey}`
      : null,
    details.quantity ? `Quantidade: ${details.quantity}` : null,
    details.venue ? `Local: ${details.venue}` : null,
    details.showDate || details.showTime
      ? `Data: ${[details.showDate, details.showTime].filter(Boolean).join(' · ')}`
      : null,
  ].filter(Boolean)
}

const ACTION_LABEL = {
  purchase: { text: 'Compra', cls: 'activity-log__badge--purchase' },
  cancellation: { text: 'Cancelamento', cls: 'activity-log__badge--cancel' },
  auto_removal: { text: 'Remoção automática', cls: 'activity-log__badge--auto' },
  event_cancel: { text: 'Evento cancelado', cls: 'activity-log__badge--event-cancel' },
  ticket_validation: { text: 'Validação', cls: 'activity-log__badge--validation' },
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'purchase', label: 'Compra' },
  { value: 'cancellation', label: 'Cancelamento' },
  { value: 'ticket_validation', label: 'Validação' },
  { value: 'event_cancel', label: 'Evento cancelado' },
  { value: 'auto_removal', label: 'Remoção automática' },
]

function actorLabel(action) {
  if (action === 'ticket_validation') return 'Portaria'
  if (action === 'event_cancel') return 'Organizador'
  if (action === 'auto_removal') return 'Sistema'
  return 'Cliente'
}

export default function ActivityLogsModal({ onClose }) {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await logService.list(token, {
          page,
          limit: PAGE_SIZE,
          action: filter,
        })
        if (!active) return
        setLogs(data.items || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [token, page, filter])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter)
    setPage(1)
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal modal--logs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-logs-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Organizador</p>
            <h2 id="activity-logs-title">Logs de pedidos</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        <p className="activity-logs__hint">
          Registro de compras, cancelamentos, validações na portaria e eventos.
        </p>

        <div className="activity-logs__filters" role="tablist" aria-label="Filtrar por tipo">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              className={`activity-logs__filter ${filter === option.value ? 'is-active' : ''}`}
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="detail-loading">
            <div className="spinner" />
            <p>Carregando logs...</p>
          </div>
        ) : null}

        {error ? <p className="detail__error">{error}</p> : null}

        {!loading && !error && logs.length === 0 ? (
          <div className="activity-logs__empty">
            <p>
              {total === 0 && filter === 'all'
                ? 'Nenhum log registrado ainda.'
                : 'Nenhum log neste filtro.'}
            </p>
          </div>
        ) : null}

        {!loading && logs.length > 0 ? (
          <>
            <div className="activity-logs__list">
              {logs.map((log) => {
                const action = ACTION_LABEL[log.action] || ACTION_LABEL.purchase
                const details = formatDetails(log)

                return (
                  <article key={log.id} className="activity-log">
                    <div className="activity-log__top">
                      <span className={`activity-log__badge ${action.cls}`}>{action.text}</span>
                      <time className="activity-log__time">{formatDateTime(log.createdAt)}</time>
                    </div>

                    <p className="activity-log__message">{log.message}</p>

                    <div className="activity-log__meta">
                      <span>
                        {actorLabel(log.action)}: <strong>{log.actorName}</strong>
                        {log.actorEmail ? ` · ${log.actorEmail}` : ''}
                      </span>
                      {log.ticketCode ? (
                        <span>
                          Ingresso: <strong>{log.ticketCode}</strong>
                        </span>
                      ) : null}
                      {log.totalPrice != null && log.action !== 'ticket_validation' ? (
                        <span>
                          Total: <strong>{formatPrice(log.totalPrice)}</strong>
                        </span>
                      ) : null}
                    </div>

                    {details.length > 0 ? (
                      <ul className="activity-log__details">
                        {details.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                )
              })}
            </div>

            <div className="activity-logs__pagination">
              <p className="activity-logs__pagination-info">
                Página {page} de {totalPages} · {total} registro{total === 1 ? '' : 's'}
              </p>
              <div className="activity-logs__pagination-actions">
                <button
                  type="button"
                  className="activity-logs__page-btn"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page <= 1 || loading}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="activity-logs__page-btn"
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                  disabled={page >= totalPages || loading}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
