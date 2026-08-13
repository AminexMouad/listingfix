import { Link, useParams } from 'react-router-dom'
import CopyButton from '../components/CopyButton'
import { useSeo } from '../lib/seo'
import { SITE, absoluteUrl } from '../lib/site'
import { PLATFORMS, getPlatform, platformHeaders, type Platform } from '../lib/platforms'
import { downloadText, toCsv } from '../lib/csv'
import NotFound from './NotFound'

function Detail({ platform }: { platform: Platform }) {
  const headers = platformHeaders(platform)
  const headerCsv = toCsv(headers, [])
  const path = `/schemas/${platform.id}`
  const requiredCount = platform.columns.filter((c) => c.required).length

  useSeo({
    title: `${platform.name} CSV Columns — Full Field List & Required Fields | ${SITE.name}`,
    description: `The complete ${platform.name} CSV column list (${platform.file}): all ${platform.columns.length} fields, which ${requiredCount} are required, and notes on the formats that cause failed uploads. Copy or download the headers free.`,
    path,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: `${platform.name} CSV column reference`,
      description: platform.summary,
      url: absoluteUrl(path),
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
    },
  })

  return (
    <div className="wrap page">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/schemas">Schema reference</Link> / {platform.name}
      </p>

      <h1>{platform.name} CSV columns</h1>
      <p className="muted small">
        {platform.file} · {platform.columns.length} columns · {requiredCount} commonly required
      </p>
      <p className="lede" style={{ maxWidth: '68ch' }}>
        {platform.summary}
      </p>

      <section className="section">
        <div className="btn-row">
          <CopyButton
            className="btn btn-primary btn-sm"
            label="Copy header row"
            text={headerCsv.trim()}
          />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => downloadText(`${platform.id}-headers.csv`, headerCsv)}
          >
            Download blank CSV
          </button>
          <Link className="btn btn-sm" to="/tools/marketplace-csv-converter">
            Convert a file to this schema
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Things that trip people up</h2>
        <ul>
          {platform.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Full column list</h2>
        <p className="small muted">
          <span className="req">*</span> marks columns that are commonly required. Requirements vary
          by category and by product type — always confirm against a freshly downloaded template.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Column</th>
                <th scope="col">Maps to</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {platform.columns.map((col) => (
                <tr key={col.name}>
                  <td>
                    <code>{col.name}</code>
                    {col.required && (
                      <span className="req" title="Commonly required">
                        {' '}
                        *
                      </span>
                    )}
                  </td>
                  <td className="muted small">{col.canonical ?? '—'}</td>
                  <td className="small">{col.note ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">
          &ldquo;Maps to&rdquo; is {SITE.name}'s internal field name. Columns sharing a field name
          across platforms are what the converter maps to each other by default.
        </p>
      </section>

      <section className="section">
        <h2>Other schemas</h2>
        <div className="btn-row">
          {PLATFORMS.filter((p) => p.id !== platform.id).map((p) => (
            <Link key={p.id} className="btn btn-sm" to={`/schemas/${p.id}`}>
              {p.name}
            </Link>
          ))}
        </div>
      </section>

      <p className="small muted">
        {SITE.name} is not affiliated with {platform.name}. Schemas are compiled from public
        documentation and real export files and can change at any time.
      </p>
    </div>
  )
}

export default function SchemaDetail() {
  const { platformId } = useParams()
  const platform = getPlatform(platformId)

  if (!platform) {
    return (
      <NotFound
        heading="Unknown platform schema"
        body="Pick one of the supported marketplace schemas from the reference index."
      />
    )
  }

  return <Detail platform={platform} />
}
