import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../../contexts/AuthContext'

const year = new Date().getFullYear()

export default function Footer() {
  const { isAuthenticated, isCliente, isOrganizer, isPortaria } = useAuth()

  return (
    <footer className="site-footer">
      <div className="site-footer__glow" aria-hidden="true" />
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link
            to={isPortaria ? '/portaria' : '/'}
            className="site-footer__logo"
            aria-label="EliteDev Eventos"
          >
            <Logo />
          </Link>
          <p className="site-footer__tagline">
            Cinema e shows em uma experiência única de ingressos.
          </p>
        </div>

        <div className="site-footer__cols">
          {!isPortaria ? (
            <div className="site-footer__col">
              <h3>Explorar</h3>
              <Link to="/cinema">Cinema</Link>
              <Link to="/eventos">Eventos</Link>
            </div>
          ) : null}

          <div className="site-footer__col">
            <h3>Conta</h3>
            {!isAuthenticated ? (
              <>
                <Link to="/login">Entrar</Link>
                <Link to="/cadastro">Criar conta</Link>
              </>
            ) : null}
            {isCliente ? <Link to="/meus-ingressos">Meus Ingressos</Link> : null}
            {isOrganizer ? <Link to="/eventos/novo">Criar evento</Link> : null}
            {isPortaria ? <Link to="/portaria">Portaria</Link> : null}
          </div>

          <div className="site-footer__col">
            <p className="site-footer__credit">
              Desenvolvido por:{' '}
              <a
                href="https://github.com/Jvsfarias"
                target="_blank"
                rel="noreferrer"
              >
                Jvsfarias
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {year} EliteDev Eventos. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
