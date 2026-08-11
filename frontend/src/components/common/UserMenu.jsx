import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import EditProfileModal from './EditProfileModal'
import { getRoleLabel } from '../../data/roles'

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatName(name = '') {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export default function UserMenu({ user, isCliente, isOrganizer, onLogout }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKey(event) {
      if (event.key === 'Escape' && !editing) setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [editing])

  function closeAnd(action) {
    return () => {
      setOpen(false)
      action?.()
    }
  }

  function openEditProfile() {
    setOpen(false)
    setEditing(true)
  }

  return (
    <>
      <div className="user-menu" ref={rootRef}>
        <button
          type="button"
          className={`user-menu__trigger ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <span className="user-menu__avatar" aria-hidden="true">
            {getInitials(user.name)}
          </span>
          <span className="user-menu__meta">
            <span className="user-menu__name">{formatName(user.name)}</span>
            <span className="user-menu__role">{getRoleLabel(user.role)}</span>
          </span>
          <span className={`user-menu__chevron ${open ? 'is-open' : ''}`} aria-hidden="true">
            ▾
          </span>
        </button>

        {open ? (
          <div className="user-menu__panel" role="menu" aria-label="Menu do usuário">
            <div className="user-menu__header">
              <span className="user-menu__avatar user-menu__avatar--lg" aria-hidden="true">
                {getInitials(user.name)}
              </span>
              <div className="user-menu__header-text">
                <strong>{formatName(user.name)}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="user-menu__role-card">
              <p className="user-menu__role-card-label">Perfil ativo</p>
              <p className="user-menu__role-card-value">{getRoleLabel(user.role)}</p>
            </div>

            {(isCliente || isOrganizer) ? (
              <div className="user-menu__section">
                <button
                  type="button"
                  className="user-menu__item"
                  role="menuitem"
                  onClick={openEditProfile}
                >
                  <span className="user-menu__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        fill="currentColor"
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      />
                    </svg>
                  </span>
                  Editar dados
                </button>

                {isCliente ? (
                  <Link
                    to="/meus-ingressos"
                    className="user-menu__item"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    <span className="user-menu__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          fill="currentColor"
                          d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-1.99 2v4a2.5 2.5 0 0 1 0 5v4c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-4a2.5 2.5 0 0 1 0-5zm-2-1.46c-1.7.85-2.67 2.5-2.67 4.46s.97 3.61 2.67 4.46V18H4v-2.54C5.7 14.61 6.67 12.96 6.67 11S5.7 7.39 4 6.54V6h16v2.54z"
                        />
                      </svg>
                    </span>
                    Meus ingressos
                  </Link>
                ) : null}

                {isOrganizer ? (
                  <Link
                    to="/eventos/novo"
                    className="user-menu__item"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    <span className="user-menu__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          fill="currentColor"
                          d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                        />
                      </svg>
                    </span>
                    Criar evento
                  </Link>
                ) : null}
              </div>
            ) : null}

            {(isCliente || isOrganizer) ? <div className="user-menu__divider" /> : null}

            <button
              type="button"
              className="user-menu__item user-menu__item--danger"
              role="menuitem"
              onClick={closeAnd(onLogout)}
            >
              <span className="user-menu__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="currentColor"
                    d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                  />
                </svg>
              </span>
              Sair
            </button>
          </div>
        ) : null}
      </div>

      {editing ? <EditProfileModal onClose={() => setEditing(false)} /> : null}
    </>
  )
}
