import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import UserMenu from './UserMenu'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isOrganizer, isPortaria, isCliente, logout } = useAuth()
  const isCinema = location.pathname === '/cinema'
  const isEventos = location.pathname === '/eventos'
  const isMyTickets = location.pathname === '/meus-ingressos'
  const isCreateEvent = location.pathname === '/eventos/novo'

  function handleLogout() {
    logout()
    navigate('/')
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
          {!isPortaria ? (
            <>
              <Link
                to="/cinema"
                className={`navbar__link ${isCinema ? 'is-active' : ''}`}
              >
                Cinema
              </Link>
              <Link
                to="/eventos"
                className={`navbar__link ${isEventos ? 'is-active' : ''}`}
              >
                Eventos
              </Link>
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
          ) : null}
        </nav>

        {isAuthenticated ? (
          <UserMenu
            user={user}
            isCliente={isCliente}
            isOrganizer={isOrganizer}
            onLogout={handleLogout}
          />
        ) : (
          <Link to="/login" className="navbar__login">
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
