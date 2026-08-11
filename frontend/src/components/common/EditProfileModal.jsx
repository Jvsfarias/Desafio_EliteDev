import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from './Toast'
import { getRoleLabel } from '../../data/roles'

export default function EditProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setEmail(user.email || '')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
  }, [user])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, loading])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Informe nome e e-mail.')
      return
    }

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError('Informe a senha atual para alterar a senha.')
        return
      }
      if (newPassword.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres.')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('A confirmação da nova senha não confere.')
        return
      }
    }

    setLoading(true)
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        ...(newPassword
          ? { currentPassword, newPassword }
          : {}),
      })
      showToast('Dados atualizados com sucesso.', 'success')
      onClose()
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar o perfil.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return createPortal(
    <div className="modal-overlay" onClick={loading ? undefined : onClose} role="presentation">
      <div
        className="modal modal--profile"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Minha conta</p>
            <h2 id="edit-profile-title">Editar dados</h2>
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

        <form className="auth-form modal__form" onSubmit={handleSubmit}>
          {error ? <p className="auth-form__error">{error}</p> : null}

          <p className="edit-profile__role">
            Perfil: <strong>{getRoleLabel(user.role)}</strong>
          </p>

          <label className="auth-form__field">
            <span>Nome</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="auth-form__field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <div className="edit-profile__password">
            <p className="edit-profile__password-title">Alterar senha (opcional)</p>

            <label className="auth-form__field">
              <span>Senha atual</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            <label className="auth-form__field">
              <span>Nova senha</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            <label className="auth-form__field">
              <span>Confirmar nova senha</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="modal__cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
