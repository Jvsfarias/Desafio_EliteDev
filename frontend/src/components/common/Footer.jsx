import { Link } from 'react-router-dom'
import Logo from './Logo'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__glow" aria-hidden="true" />
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo" aria-label="EliteDev Eventos">
            <Logo />
          </Link>
          <p className="site-footer__tagline">
            Cinema e shows em uma experiência única de ingressos.
          </p>
        </div>

        <div className="site-footer__cols">
          <div className="site-footer__col">
            <h3>Explorar</h3>
            <Link to="/cinema">Cinema</Link>
            <Link to="/eventos">Eventos</Link>
          </div>

          <div className="site-footer__col">
            <h3>Conta</h3>
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Criar conta</Link>
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
