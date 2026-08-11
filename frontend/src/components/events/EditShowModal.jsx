import { useEffect, useState } from 'react'
import CancelEventModal from './CancelEventModal'
import ShowVenueMap from './ShowVenueMap'
import { useToast } from '../common/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { SHOW_AREAS, areasFromEvent } from '../../data/showAreas'
import { eventService } from '../../services/eventService'

export default function EditShowModal({ event, onClose, onSaved, onDeleted }) {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [venue, setVenue] = useState('')
  const [showDate, setShowDate] = useState('')
  const [showTime, setShowTime] = useState('')
  const [description, setDescription] = useState('')
  const [areas, setAreas] = useState([])
  const [activeAreaKey, setActiveAreaKey] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!event) return
    setVenue(event.venue || '')
    setShowDate(event.showDate || '')
    setShowTime(event.showTime || '')
    setDescription(event.description || '')
    setAreas(areasFromEvent(event.areas))
    setError('')
  }, [event])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !confirmCancel) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, confirmCancel])

  function updateArea(key, field, value) {
    setAreas((current) =>
      current.map((area) => (area.key === key ? { ...area, [field]: value } : area)),
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!venue) {
      setError('Informe o local do evento.')
      return
    }

    if (!showDate || !showTime) {
      setError('Informe data e horário do show.')
      return
    }

    const normalizedAreas = areas.map((area) => ({
      key: area.key,
      label: area.label,
      capacity: Number(area.capacity) || 0,
      price: Number(area.price) || 0,
    }))

    if (normalizedAreas.every((area) => area.capacity === 0)) {
      setError('Defina a capacidade de ao menos uma área.')
      return
    }

    setLoading(true)

    try {
      const updated = await eventService.update(
        event.id,
        {
          venue,
          description,
          showDate,
          showTime,
          areas: normalizedAreas,
        },
        token,
      )
      onSaved?.(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Não foi possível salvar as alterações.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmCancel() {
    setCancelling(true)
    setError('')
    try {
      const result = await eventService.cancel(event.id, token)
      showToast(
        result.refundedTickets > 0
          ? `Evento cancelado. ${result.refundedTickets} ingresso(s) reembolsado(s).`
          : 'Evento cancelado com sucesso.',
        'success',
      )
      onDeleted?.(event.id)
      onClose()
    } catch (err) {
      setError(err.message || 'Não foi possível cancelar o evento.')
      setConfirmCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  if (!event) return null

  return (
    <>
      <div className="modal-overlay" onClick={onClose} role="presentation">
        <div
          className="modal modal--wide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-show-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="modal__header">
            <div>
              <p className="modal__eyebrow">Editar show</p>
              <h2 id="edit-show-title">{event.title}</h2>
            </div>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </header>

          <form className="auth-form modal__form" onSubmit={handleSubmit}>
            {error ? <p className="auth-form__error">{error}</p> : null}

            <label className="auth-form__field">
              <span>Local do evento</span>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </label>

            <div className="create-event__row">
              <label className="auth-form__field">
                <span>Data</span>
                <input
                  type="date"
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  required
                />
              </label>
              <label className="auth-form__field">
                <span>Horário</span>
                <input
                  type="time"
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  required
                />
              </label>
            </div>

            <section className="create-event__description" aria-label="Descrição do evento">
              <div className="create-event__section-head">
                <h3>Descrição do evento</h3>
              </div>
              <label className="auth-form__field">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione aqui a descrição do seu evento..."
                  rows={5}
                />
              </label>
            </section>

            <section className="create-event__areas" aria-label="Áreas do venue">
              <div className="create-event__section-head">
                <h3>Mapa de áreas</h3>
              </div>

              <ShowVenueMap activeKey={activeAreaKey} />

              <div className="create-event__areas-grid">
                {SHOW_AREAS.map((areaDef) => {
                  const area = areas.find((item) => item.key === areaDef.key)
                  return (
                    <div
                      key={areaDef.key}
                      className="create-event__area-row"
                      onFocus={() => setActiveAreaKey(areaDef.key)}
                      onBlur={() => setActiveAreaKey(null)}
                    >
                      <span
                        className="create-event__area-dot"
                        style={{ background: areaDef.color }}
                      />
                      <span className="create-event__area-label">{areaDef.label}</span>
                      <label className="auth-form__field create-event__area-field">
                        <span>Capacidade</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={area?.capacity ?? ''}
                          onChange={(e) => updateArea(areaDef.key, 'capacity', e.target.value)}
                          placeholder="0"
                        />
                      </label>
                      <label className="auth-form__field create-event__area-field">
                        <span>Preço (R$)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={area?.price ?? ''}
                          onChange={(e) => updateArea(areaDef.key, 'price', e.target.value)}
                          placeholder="0,00"
                        />
                      </label>
                    </div>
                  )
                })}
              </div>
            </section>

            <div className="modal__actions modal__actions--split">
              <button
                type="button"
                className="btn btn--ghost modal__danger-btn"
                onClick={() => setConfirmCancel(true)}
                disabled={loading || cancelling}
              >
                Cancelar evento
              </button>
              <div className="modal__actions-right">
                <button type="button" className="modal__cancel" onClick={onClose} disabled={loading}>
                  Fechar
                </button>
                <button type="submit" className="auth-form__submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {confirmCancel ? (
        <CancelEventModal
          event={event}
          loading={cancelling}
          onClose={() => {
            if (!cancelling) setConfirmCancel(false)
          }}
          onConfirm={handleConfirmCancel}
        />
      ) : null}
    </>
  )
}
