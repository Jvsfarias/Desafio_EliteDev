import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const { user, isAuthenticated, isOrganizer, isPortaria, isCliente, logout } = useAuth()
  const showRole = user?.role && user.role !== 'cliente'
  const isMyTickets = location.pathname === '/meus-ingressos'
  const isCreateEvent = location.pathname === '/eventos/novo'
  const sectionActive = !isMyTickets && !isCreateEvent

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
            <Link to="/portaria" className="navbar__link is-active">
              Portaria
            </Link>
          ) : (
            <>
              <button
                type="button"
                className={`navbar__link ${sectionActive && activeSection === 'cinema' ? 'is-active' : ''}`}
                onClick={() => handleSectionNavigate('cinema')}
              >
                Cinema
              </button>
              <button
                type="button"
                className={`navbar__link ${sectionActive && activeSection === 'eventos' ? 'is-active' : ''}`}
                onClick={() => handleSectionNavigate('eventos')}
              >
                Eventos
              </button>
              {isCliente ? (
                <Link
                  to="/meus-ingressos"
                  className={`navbar__link ${isMyTickets ? 'is-active' : ''}`}
                >
                  Meus Ingressos
                </Link>
              ) : null}
              {isOrganizer ? (
                <Link
                  to="/eventos/novo"
                  className={`navbar__link ${isCreateEvent ? 'is-active' : ''}`}
                >
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
