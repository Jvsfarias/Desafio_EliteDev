import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLabel } from '../../data/roles'

function formatName(name = '') {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export default function Navbar({ activeSection, onNavigate }) {
  const navigate = useNavigate()
  const { user, isAuthenticated, isOrganizer, isPortaria, logout } = useAuth()
  const showRole = user?.role && user.role !== 'cliente'

  function handleSectionNavigate(section) {
    if (onNavigate) {
      onNavigate(section)
      return
    }

    navigate(`/#${section}`)
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link
          to={isPortaria ? '/portaria' : '/'}
          className="navbar__brand"
          aria-label="EliteDev Eventos"
        >
          <Logo />
        </Link>

        <nav className="navbar__nav" aria-label="Principal">
          {isPortaria ? (
            <Link to="/portaria" className="navbar__action is-active">
              Portaria
            </Link>
          ) : (
            <>
              <button
                type="button"
                className={`navbar__link ${activeSection === 'cinema' ? 'is-active' : ''}`}
                onClick={() => handleSectionNavigate('cinema')}
              >
                Cinema
              </button>
              <button
                type="button"
                className={`navbar__link ${activeSection === 'eventos' ? 'is-active' : ''}`}
                onClick={() => handleSectionNavigate('eventos')}
              >
                Eventos
              </button>
              {isOrganizer ? (
                <Link to="/eventos/novo" className="navbar__action">
                  Criar evento
                </Link>
              ) : null}
            </>
          )}
        </nav>

        {isAuthenticated ? (
          <div className="navbar__session">
            <div className="navbar__user">
              <span className="navbar__user-name">{formatName(user.name)}</span>
              {showRole ? (
                <span className="navbar__user-role">{getRoleLabel(user.role)}</span>
              ) : null}
            </div>
            <button type="button" className="navbar__login" onClick={logout}>
              Sair
            </button>
          </div>
        ) : (
          <Link to="/login" className="navbar__login">
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
