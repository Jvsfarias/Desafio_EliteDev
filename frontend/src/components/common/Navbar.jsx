import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLabel } from '../../data/roles'

function formatName(name = '') {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export default function Navbar({ activeSection, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth()
  const showRole = user?.role && user.role !== 'cliente'

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="EliteDev Eventos">
          <Logo />
        </Link>

        <nav className="navbar__nav" aria-label="Principal">
          <button
            type="button"
            className={`navbar__link ${activeSection === 'cinema' ? 'is-active' : ''}`}
            onClick={() => onNavigate('cinema')}
          >
            Cinema
          </button>
          <button
            type="button"
            className={`navbar__link ${activeSection === 'eventos' ? 'is-active' : ''}`}
            onClick={() => onNavigate('eventos')}
          >
            Eventos
          </button>
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
