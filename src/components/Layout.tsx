import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE } from '../lib/site'
import { PLATFORMS } from '../lib/platforms'

const NAV = [
  { to: '/tools/amazon-error-decode', label: 'Error decoder' },
  { to: '/tools/marketplace-csv-converter', label: 'CSV converter' },
  { to: '/schemas', label: 'Schema reference' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <header className="header">
        <div className="wrap header-inner">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">
              LF
            </span>
            {SITE.name}
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-cols">
            <div>
              <h3>Tools</h3>
              <ul>
                <li>
                  <Link to="/tools/amazon-error-decode">Amazon flat-file error decoder</Link>
                </li>
                <li>
                  <Link to="/tools/marketplace-csv-converter">Marketplace CSV converter</Link>
                </li>
                <li>
                  <Link to="/schemas">Platform column reference</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3>Schemas</h3>
              <ul>
                {PLATFORMS.map((p) => (
                  <li key={p.id}>
                    <Link to={`/schemas/${p.id}`}>{p.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Site</h3>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/privacy">Privacy &amp; how it works</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-legal">
            <p>
              <strong>Privacy:</strong> {SITE.name} runs entirely in your browser. CSV files and
              pasted data are processed locally with JavaScript and are never uploaded to a server.
              There is no account, no database and no file storage.
            </p>
            <p>
              <strong>Disclaimer:</strong> {SITE.name} is an independent tool and is not affiliated
              with, endorsed by or sponsored by Amazon, eBay, Etsy, Shopify or WooCommerce. Error
              explanations and column schemas are community-maintained interpretations that change
              over time — this tool assists you, but always verify against the official platform
              documentation and your own processing report before acting.
            </p>
            <p>
              All product and company names are trademarks of their respective owners. ©{' '}
              {new Date().getFullYear()} {SITE.name}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
