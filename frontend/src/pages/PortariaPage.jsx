import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { ticketService } from '../services/ticketService'

const RESULT_CONFIG = {
  valid:       { icon: '✅', cls: 'portaria__result--valid',       label: 'VÁLIDO' },
  used:        { icon: '🔴', cls: 'portaria__result--used',        label: 'JÁ UTILIZADO' },
  wrong_event: { icon: '⚠️', cls: 'portaria__result--wrong',      label: 'EVENTO ERRADO' },
  invalid:     { icon: '❌', cls: 'portaria__result--invalid',     label: 'INVÁLIDO' },
}

function extractCodeFromUrl(raw) {
  try {
    const url = new URL(raw)
    const parts = url.pathname.split('/')
    const idx = parts.indexOf('ingresso')
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
  } catch {}
  return raw.trim().toUpperCase()
}

export default function PortariaPage() {
  const { token } = useAuth()
  const [manualCode, setManualCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const scannerRef = useRef(null)
  const divId = 'portaria-qr-scanner'

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [])

  async function validate(rawCode) {
    const code = extractCodeFromUrl(rawCode)
    if (!code) return

    setLoading(true)
    setResult(null)

    try {
      const res = await ticketService.useTicket(code, token)
      setResult(res)
    } catch (err) {
      setResult({ valid: false, reason: 'invalid', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    if (manualCode.trim()) validate(manualCode.trim())
  }

  function handleReset() {
    setResult(null)
    setManualCode('')
  }

  function toggleScanner() {
    if (scannerActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
      setScannerActive(false)
      return
    }

    setScannerActive(true)

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        divId,
        { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [0] },
        false,
      )

      scanner.render(
        (decodedText) => {
          scanner.clear().catch(() => {})
          scannerRef.current = null
          setScannerActive(false)
          validate(decodedText)
        },
        () => {},
      )

      scannerRef.current = scanner
    }, 100)
  }

  const cfg = result ? (RESULT_CONFIG[result.reason] ?? RESULT_CONFIG.invalid) : null

  return (
    <>
      <Navbar />

      <main className="portaria container">
        <header className="portaria__header">
          <h1>Portaria</h1>
          <p>Valide o ingresso do participante por QR code ou código manual.</p>
        </header>

        {!result ? (
          <div className="portaria__inputs">
            <button
              type="button"
              onClick={toggleScanner}
              className={`btn ${scannerActive ? 'btn--secondary' : 'btn--primary'} portaria__scan-btn`}
            >
              {scannerActive ? '⏹ Parar câmera' : '📷 Ler QR pela câmera'}
            </button>

            {scannerActive && (
              <div className="portaria__scanner-wrap">
                <div id={divId} />
              </div>
            )}

            <div className="portaria__divider">
              <span>ou digite o código</span>
            </div>

            <form className="portaria__form" onSubmit={handleManualSubmit}>
              <input
                type="text"
                className="portaria__code-input"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Ex.: A1B2C3D4"
                maxLength={16}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!manualCode.trim() || loading}
              >
                {loading ? 'Validando...' : 'Validar'}
              </button>
            </form>
          </div>
        ) : (
          <div className={`portaria__result ${cfg.cls}`}>
            <span className="portaria__result-icon">{cfg.icon}</span>
            <span className="portaria__result-label">{cfg.label}</span>
            <p className="portaria__result-message">{result.message}</p>

            {result.ticket && (
              <div className="portaria__ticket-info">
                <p><strong>{result.ticket.eventTitle}</strong></p>
                {result.ticket.seats?.length > 0 && (
                  <p>Assentos: {result.ticket.seats.join(', ')}</p>
                )}
                {result.ticket.areaLabel && (
                  <p>Área: {result.ticket.areaLabel} · {result.ticket.quantity} ingresso(s)</p>
                )}
                {result.ticket.eventVenue && (
                  <p>Local: {result.ticket.eventVenue}</p>
                )}
                {result.usedAt && (
                  <p className="portaria__used-at">
                    Utilizado em {new Date(result.usedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            )}

            <button type="button" className="btn btn--primary portaria__next-btn" onClick={handleReset}>
              Próximo ingresso
            </button>
          </div>
        )}
      </main>
    </>
  )
}
