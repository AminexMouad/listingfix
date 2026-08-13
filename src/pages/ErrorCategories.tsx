import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { SITE } from '../lib/site'
import { AMAZON_ERRORS, ERROR_CATEGORIES } from '../lib/errors'

export default function ErrorCategories() {
  const title = `Amazon Flat-File Error Codes by Category — ${AMAZON_ERRORS.length} Code Fixes | ${SITE.name}`
  const description =
    'Browse Amazon flat-file error codes grouped by category — brand, product type, duplicate & matching, feed format, images, identifiers, pricing and more. Each code has a plain-English explanation and a step-by-step fix. Free.'

  useSeo({
    title,
    description,
    path: '/amazon-errors/',
    keywords: [
      'amazon flat file errors',
      'amazon product upload errors',
      'amazon inventory errors',
      'amazon error codes list',
      'amazon catalog errors by category',
      'fix amazon listing errors',
    ].join(', '),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Amazon flat-file error codes by category',
      numberOfItems: AMAZON_ERRORS.length,
      itemListElement: AMAZON_ERRORS.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE.url}/amazon-error/${e.code}`,
        name: `How to fix Amazon error ${e.code} — ${e.title}`,
      })),
    },
  })

  return (
    <div className="wrap page">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/tools/amazon-error-decode">Amazon error decoder</Link> / All error codes
      </p>

      <h1>Amazon flat-file error codes by category</h1>
      <p className="lede muted" style={{ maxWidth: '68ch' }}>
        Every Amazon flat-file, product-upload and inventory error we cover, grouped by what goes wrong. Pick a
        category, or jump straight to a code and get a plain-English explanation and the fix.
      </p>

      {ERROR_CATEGORIES.map((cat) => {
        const errors = AMAZON_ERRORS.filter((e) => e.category === cat)
        return (
          <section className="section" key={cat}>
            <h2 id={cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{cat}</h2>
            <ul className="code-list">
              {errors.map((error) => (
                <li key={error.code}>
                  <Link className="code-item" to={`/amazon-error/${error.code}`}>
                    <span className="code-badge">{error.code}</span>
                    <span className="code-item-body">
                      <strong>{error.title}</strong>
                      <span>{error.cause.slice(0, 120)}…</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <p className="small muted">
        {SITE.name} is not affiliated with Amazon. These explanations are practitioner interpretations; Amazon's
        validation rules change, so verify against your current processing report.
      </p>
    </div>
  )
}