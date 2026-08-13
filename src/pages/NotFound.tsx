import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { SITE } from '../lib/site'

export default function NotFound({
  heading = 'Page not found',
  body = 'That page does not exist. The two tools below are what this site is for.',
}: {
  heading?: string
  body?: string
}) {
  useSeo({
    title: `${heading} | ${SITE.name}`,
    description: body,
    path: '/404',
    noIndex: true,
  })

  return (
    <div className="wrap wrap-narrow page">
      <h1>{heading}</h1>
      <p className="muted">{body}</p>
      <div className="btn-row" style={{ marginTop: '1.5rem' }}>
        <Link className="btn btn-primary" to="/tools/amazon-error-decode">
          Amazon error decoder
        </Link>
        <Link className="btn" to="/tools/marketplace-csv-converter">
          Marketplace CSV converter
        </Link>
        <Link className="btn" to="/">
          Home
        </Link>
      </div>
    </div>
  )
}
