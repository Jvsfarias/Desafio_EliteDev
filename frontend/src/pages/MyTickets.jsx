import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { useToast } from '../components/common/Toast'
import { useAuth } from '../contexts/AuthContext'
import { ticketService } from '../services/ticketService'

function formatPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return new Date(+year, +month - 1, +day).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function TicketCard({ ticket, qrSrc, onRequestCancel, cancelling }) {
  const isCinema = ticket.seats?.length > 0

  return (
    <article className="my-ticket">
      <div className="my-ticket__qr">
        {qrSrc ? (
          <img src={qrSrc} alt={`QR do ingresso ${ticket.code}`} />
        ) : (
          <div className="my-ticket__qr-placeholder">
            <div className="spinner" />
          </div>
        )}
        <p className="my-ticket__code">{ticket.code}</p>
      </div>

      <div className="my-ticket__info">
        <h2 className="my-ticket__title">{ticket.eventTitle}</h2>
        {ticket.eventVenue ? (
          <p className="my-ticket__meta">{ticket.eventVenue}</p>
        ) : null}

        {isCinema ? (
          <>
            <p className="my-ticket__meta">
              {formatDate(ticket.sessionDate)} · {ticket.sessionTime}
            </p>
            <p className="my-ticket__meta">
              Assentos: <strong>{ticket.seats.join(', ')}</strong>
            </p>
          </>
        ) : (
          <>
            <p className="my-ticket__meta">
              {formatDate(ticket.eventDate)} · {ticket.eventTime}
            </p>
            <p className="my-ticket__meta">
              {ticket.areaLabel} · {ticket.quantity} ingresso(s)
            </p>
          </>
        )}

        <p className="my-ticket__price">{formatPrice(ticket.totalPrice)}</p>

        <div className="my-ticket__actions">
          <Link to={`/ingresso/${ticket.code}`} className="btn btn--secondary">
            Abrir ingresso
          </Link>
          <button
            type="button"
            className="btn btn--ghost my-ticket__cancel"
            disabled={cancelling}
            onClick={() => onRequestCancel(ticket)}
          >
            Cancelar ingresso
          </button>
        </div>
      </div>
    </article>
  )
}

function CancelTicketModal({ ticket, loading, onClose, onConfirm }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, loading])

  if (!ticket) return null

  const isCinema = ticket.seats?.length > 0

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose} role="presentation">
      <div
        className="modal modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-ticket-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Cancelamento</p>
            <h2 id="cancel-ticket-title">Cancelar ingresso?</h2>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="modal__body">
          <p className="modal__text">
            Esta ação não pode ser desfeita. Os assentos ou vagas voltam para o estoque
            e o ingresso deixa de ser válido.
          </p>

          <div className="modal__ticket-summary">
            <strong>{ticket.eventTitle}</strong>
            <span>Código: {ticket.code}</span>
            {isCinema ? (
              <span>
                {formatDate(ticket.sessionDate)} · {ticket.sessionTime} · Assentos{' '}
                {ticket.seats.join(', ')}
              </span>
            ) : (
              <span>
                {formatDate(ticket.eventDate)} · {ticket.eventTime} · {ticket.areaLabel} (
                {ticket.quantity})
              </span>
            )}
          </div>
        </div>

        <div className="modal__actions">
          <button
            type="button"
            className="modal__cancel"
            onClick={onClose}
            disabled={loading}
          >
            Manter ingresso
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyTickets() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [tickets, setTickets] = useState([])
  const [qrMap, setQrMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticketToCancel, setTicketToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const list = await ticketService.listMine(token, 'active')
        if (!active) return
        setTickets(list)

        const entries = await Promise.all(
          list.map(async (ticket) => {
            const url = `${window.location.origin}/ingresso/${ticket.code}`
            const src = await QRCode.toDataURL(url, { width: 200, margin: 2 })
            return [ticket.code, src]
          }),
        )

        if (active) setQrMap(Object.fromEntries(entries))
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

  async function handleConfirmCancel() {
    if (!ticketToCancel) return

    const code = ticketToCancel.code
    setCancelling(true)
    setError('')

    try {
      await ticketService.cancelTicket(code, token)
      setTickets((current) => current.filter((ticket) => ticket.code !== code))
      setQrMap((current) => {
        const next = { ...current }
        delete next[code]
        return next
      })
      setTicketToCancel(null)
      showToast('Ingresso cancelado. Estoque atualizado.', 'success')
    } catch (err) {
      showToast(err.message || 'Erro ao cancelar ingresso.', 'error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="my-tickets container">
        <header className="my-tickets__header">
          <h1>Meus Ingressos</h1>
          <p>Ingressos ativos com QR code para entrada no evento.</p>
        </header>

        {loading ? (
          <div className="detail-loading">
            <div className="spinner" />
            <p>Carregando ingressos...</p>
          </div>
        ) : null}

        {error ? <p className="detail__error">{error}</p> : null}

        {!loading && tickets.length === 0 ? (
          <div className="my-tickets__empty">
            <p>Você não tem ingressos ativos no momento.</p>
            <Link to="/" className="btn btn--primary">
              Ver eventos
            </Link>
          </div>
        ) : null}

        {!loading && tickets.length > 0 ? (
          <div className="my-tickets__list">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.code}
                ticket={ticket}
                qrSrc={qrMap[ticket.code]}
                onRequestCancel={setTicketToCancel}
                cancelling={cancelling && ticketToCancel?.code === ticket.code}
              />
            ))}
          </div>
        ) : null}
      </main>

      {ticketToCancel ? (
        <CancelTicketModal
          ticket={ticketToCancel}
          loading={cancelling}
          onClose={() => {
            if (!cancelling) setTicketToCancel(null)
          }}
          onConfirm={handleConfirmCancel}
        />
      ) : null}
    </>
  )
}
