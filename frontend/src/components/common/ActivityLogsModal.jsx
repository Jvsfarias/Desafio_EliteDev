import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import { logService } from '../../services/logService'

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
}

export default function ActivityLogsModal({ onClose }) {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await logService.list(token)
        if (active) setLogs(data)
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
  }, [token])

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
          Registro de compras e cancelamentos realizados pelos clientes.
        </p>

        {loading ? (
          <div className="detail-loading">
            <div className="spinner" />
            <p>Carregando logs...</p>
          </div>
        ) : null}

        {error ? <p className="detail__error">{error}</p> : null}

        {!loading && !error && logs.length === 0 ? (
          <div className="activity-logs__empty">
            <p>Nenhum log registrado ainda.</p>
          </div>
        ) : null}

        {!loading && logs.length > 0 ? (
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
                      Cliente: <strong>{log.actorName}</strong>
                      {log.actorEmail ? ` · ${log.actorEmail}` : ''}
                    </span>
                    {log.ticketCode ? (
                      <span>
                        Ingresso: <strong>{log.ticketCode}</strong>
                      </span>
                    ) : null}
                    {log.totalPrice != null ? (
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
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
