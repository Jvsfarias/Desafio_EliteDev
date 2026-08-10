import Logo from './Logo'

export default function Navbar({ activeSection, onNavigate }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a href="/" className="navbar__brand" aria-label="EliteDev Eventos">
          <Logo />
        </a>

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

        <button type="button" className="navbar__login">
          Entrar
        </button>
      </div>
    </header>
  )
}
