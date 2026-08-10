import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__brand" aria-label="EliteDev Eventos">
          <Logo />
        </Link>

        <header className="auth__header">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </header>

        {children}

        {footer ? <div className="auth__footer">{footer}</div> : null}
      </div>
    </div>
  )
}
