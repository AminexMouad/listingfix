import { Link, useParams } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { SITE, absoluteUrl } from '../lib/site'
import {
  AMAZON_ERRORS,
  SEVERITY_HINT,
  SEVERITY_LABEL,
  getError,
  type AmazonError,
} from '../lib/errors'
import NotFound from './NotFound'

function RelatedList({ error }: { error: AmazonError }) {
  const related = error.related.map((code) => getError(code)).filter((e) => e !== undefined)
  if (related.length === 0) return null
  return (
    <section className="section">
      <h2>Related error codes</h2>
      <ul className="code-list">
        {related.map((rel) => (
          <li key={rel.code}>
            <Link className="code-item" to={`/amazon-error/${rel.code}`}>
              <span className="code-badge">{rel.code}</span>
              <span className="code-item-body">
                <strong>{rel.title}</strong>
                <span>{rel.cause}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Detail({ error }: { error: AmazonError }) {
  const path = `/amazon-error/${error.code}`
  const title = `How to Fix Amazon Error ${error.code} (${error.title}) — Step-by-Step | ${SITE.name}`
  const description = `Amazon flat-file error ${error.code} means: ${error.title}. ${error.cause.slice(0, 110)}… Here’s the step-by-step fix to get your listing processing.`
  const keywords = [`amazon error ${error.code}`, `error ${error.code} amazon`, `fix amazon error ${error.code}`, `amazon flat file error ${error.code}`, ...error.keywords].join(', ')

  useSeo({
    title,
    description,
    path,
    keywords,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          headline: `How to fix Amazon flat-file error ${error.code}: ${error.title}`,
          description: error.cause,
          url: absoluteUrl(path),
          articleSection: error.category,
          keywords: [`amazon error ${error.code}`, ...error.keywords].join(', '),
          isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
        },
        {
          '@type': 'HowTo',
          name: `How to fix Amazon error ${error.code}`,
          description: error.cause,
          step: error.fix.map((text, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            text,
          })),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Amazon error decoder',
              item: absoluteUrl('/tools/amazon-error-decode'),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: `Error ${error.code}`,
              item: absoluteUrl(path),
            },
          ],
        },
      ],
    },
  })

  return (
    <div className="wrap wrap-narrow page">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/tools/amazon-error-decode">Amazon error decoder</Link>{' '}
        / Error {error.code}
      </p>

      <div className="detail-head">
        <span className="detail-code">Error {error.code}</span>
        <span className={`pill pill-${error.severity}`}>{SEVERITY_LABEL[error.severity]}</span>
      </div>
      <h1>{error.title}</h1>
      <p className="muted small">
        {SEVERITY_HINT[error.severity]} · Category: {error.category}
      </p>

      <section className="section">
        <h2>What it means</h2>
        <p>{error.cause}</p>
      </section>

      <section className="section">
        <h2>How to fix error {error.code}</h2>
        <ol className="steps">
          {error.fix.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="notice">
          <p>
            <strong>Before you re-upload:</strong> test with two or three rows first. A 5,000-row
            file that fails the same way twice costs you a day; a three-row file tells you in
            minutes. Keep the processing report from each attempt so you can see what changed.
          </p>
        </div>
      </section>

      <RelatedList error={error} />

      <section className="section">
        <h2>Keep going</h2>
        <div className="btn-row">
          <Link className="btn btn-primary" to="/tools/amazon-error-decode">
            Decode another code
          </Link>
          <Link className="btn" to="/schemas/amazon-flat-file">
            Amazon flat-file columns
          </Link>
          <Link className="btn" to="/tools/marketplace-csv-converter">
            Convert a CSV
          </Link>
        </div>
      </section>

      <p className="small muted">
        {SITE.name} is not affiliated with Amazon. This explanation is a practitioner
        interpretation of error {error.code}; Amazon's validation rules change over time, so verify
        against your current processing report and Seller Central help pages.
      </p>
    </div>
  )
}

export default function ErrorDetail() {
  const { code } = useParams()
  const error = getError(code)

  if (!error) {
    return (
      <NotFound
        heading={`No entry for error code ${code ?? ''}`}
        body={`This database covers ${AMAZON_ERRORS.length} Amazon flat-file codes. Search the decoder for the code or a keyword from the message text.`}
      />
    )
  }

  return <Detail error={error} />
}
