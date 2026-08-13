import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorListItem from '../components/ErrorListItem'
import { useSeo } from '../lib/seo'
import { SITE, absoluteUrl } from '../lib/site'
import {
  AMAZON_ERRORS,
  ERROR_CATEGORIES,
  extractCodes,
  getError,
  searchErrors,
} from '../lib/errors'
import sampleReport from '../../samples/sample-amazon-processing-report.txt?raw'

export default function ErrorDecoder() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const pastedCodes = useMemo(() => {
    if (query.trim().length < 12) return []
    return extractCodes(query)
      .map((code) => getError(code))
      .filter((e) => e !== undefined)
  }, [query])

  const results = useMemo(() => {
    const hits = searchErrors(query).map((h) => h.error)
    return category ? hits.filter((e) => e.category === category) : hits
  }, [query, category])

  const grouped = useMemo(() => {
    if (query.trim()) return null
    return ERROR_CATEGORIES.map((cat) => ({
      category: cat,
      errors: results.filter((e) => e.category === cat),
    })).filter((group) => group.errors.length > 0)
  }, [query, results])

  useSeo({
    title: `Amazon Flat-File Error Code Decoder — ${AMAZON_ERRORS.length} Codes Explained | ${SITE.name}`,
    description:
      'Paste an Amazon flat-file error code or a whole processing report and get a plain-English explanation, the likely cause and step-by-step fix. Covers 8541, 8016, 5665, 8555, 8105, 99007, 13013 and more. Free and fully in-browser.',
    path: '/tools/amazon-error-decode',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Amazon flat-file error codes',
      numberOfItems: AMAZON_ERRORS.length,
      itemListElement: AMAZON_ERRORS.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`/amazon-error/${e.code}`),
        name: `Amazon error ${e.code} — ${e.title}`,
      })),
    },
  })

  return (
    <div className="wrap page">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / Amazon error decoder
      </p>

      <h1>Amazon flat-file error code decoder</h1>
      <p className="lede muted" style={{ maxWidth: '68ch' }}>
        Amazon's processing reports tell you a row failed and give you a number. This page turns that
        number into an explanation, a likely cause and a numbered fix. Type a code, search by keyword
        like <code>upc</code> or <code>variation</code>, or paste the whole report.
      </p>

      <div className="card section">
        <div className="field search-big">
          <label htmlFor="error-search">Error code, keyword, or pasted processing report</label>
          <textarea
            id="error-search"
            rows={query.includes('\n') ? 8 : 2}
            placeholder="e.g. 8541 — or paste the error text from your processing report"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <p className="hint">
            Nothing you paste is uploaded — the search runs against a local database in this page.
          </p>
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-sm" onClick={() => setQuery(sampleReport)}>
            Load a sample report
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setQuery('')
              setCategory('')
            }}
            disabled={!query && !category}
          >
            Clear
          </button>
        </div>
      </div>

      {pastedCodes.length > 0 && (
        <section className="section">
          <div className="notice notice-ok">
            <p>
              <strong>{pastedCodes.length} known error code(s)</strong> found in the text you pasted.
            </p>
          </div>
          <ul className="code-list">
            {pastedCodes.map((error) => (
              <ErrorListItem key={`found-${error.code}`} error={error} />
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <div className="chip-row">
          <button
            type="button"
            className="chip"
            aria-pressed={category === ''}
            onClick={() => setCategory('')}
          >
            All categories
          </button>
          {ERROR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="chip"
              aria-pressed={category === cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2>
          {query.trim()
            ? `${results.length} match${results.length === 1 ? '' : 'es'}`
            : `All ${results.length} error codes`}
        </h2>

        {results.length === 0 && (
          <div className="notice notice-warn">
            <p>
              No match for that code or keyword yet. Amazon uses hundreds of internal codes and this
              database covers the {AMAZON_ERRORS.length} that sellers hit most. Check the full text
              of the message in your processing report — it usually names the offending column, which
              is more useful than the number itself.
            </p>
          </div>
        )}

        {grouped ? (
          grouped.map((group) => (
            <div key={group.category} style={{ marginBottom: '2rem' }}>
              <h3>{group.category}</h3>
              <ul className="code-list">
                {group.errors.map((error) => (
                  <ErrorListItem key={error.code} error={error} />
                ))}
              </ul>
            </div>
          ))
        ) : (
          <ul className="code-list">
            {results.map((error) => (
              <ErrorListItem key={error.code} error={error} />
            ))}
          </ul>
        )}
      </section>

      <section className="section wrap-narrow" style={{ padding: 0 }}>
        <h2>How Amazon flat-file errors work</h2>
        <p>
          When you upload a flat file, Amazon validates it in stages. The file is parsed first, then
          each row is checked against the rules for the product type you declared, then the row is
          compared against what already exists in the catalog. A failure at any stage produces a row
          in the processing report with an error code and a message.
        </p>
        <p>
          The number tells you which validator rejected the row; the message text tells you which
          column. Fix the column named in the message, not just the symptom — resubmitting the same
          data unchanged produces the same error and, for catalog conflicts, can be read as abuse.
        </p>
        <h3>Reading a processing report</h3>
        <ul>
          <li>
            <strong>Original record number</strong> — the row in your uploaded file, counting from
            the first data row.
          </li>
          <li>
            <strong>SKU</strong> — which item failed. Blank means the whole file failed to parse.
          </li>
          <li>
            <strong>Error code</strong> — the validator that rejected it. That is what this tool
            decodes.
          </li>
          <li>
            <strong>Error message</strong> — the human-readable detail, usually naming the exact
            attribute.
          </li>
        </ul>
        <p className="small muted">
          Not affiliated with Amazon. Codes and validation rules change; always confirm against your
          own processing report and current Seller Central documentation.
        </p>
      </section>
    </div>
  )
}
