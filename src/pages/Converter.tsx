import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CopyButton from '../components/CopyButton'
import { useSeo } from '../lib/seo'
import { SITE } from '../lib/site'
import { PLATFORMS, getPlatform, platformHeaders } from '../lib/platforms'
import {
  TRANSFORMS,
  convertRows,
  defaultMapping,
  fillDownByGroup,
  groupColumnFor,
  type MappingRule,
  type TransformId,
} from '../lib/convert'
import { downloadText, parseCsv, toCsv } from '../lib/csv'
import shopifySample from '../../samples/shopify-products-sample.csv?raw'
import wooSample from '../../samples/woocommerce-products-sample.csv?raw'
import amazonSample from '../../samples/amazon-inventory-loader-sample.csv?raw'

const SAMPLES: Record<string, string> = {
  shopify: shopifySample,
  woocommerce: wooSample,
  'amazon-inventory-loader': amazonSample,
}

const PREVIEW_ROWS = 8

export default function Converter() {
  const [sourceId, setSourceId] = useState('shopify')
  const [targetId, setTargetId] = useState('amazon-flat-file')
  const [raw, setRaw] = useState('')
  const [rules, setRules] = useState<MappingRule[]>([])
  const [tab, setTab] = useState<'convert' | 'headers'>('convert')
  const [fillDown, setFillDown] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const source = getPlatform(sourceId) ?? PLATFORMS[0]
  const target = getPlatform(targetId) ?? PLATFORMS[1]

  const parsed = useMemo(() => parseCsv(raw), [raw])
  const headerKey = parsed.headers.join('\u0000')

  // Reset the mapping whenever the pair or the incoming header row changes.
  useEffect(() => {
    setRules(defaultMapping(source, target, headerKey ? headerKey.split('\u0000') : []))
  }, [source, target, headerKey])

  const groupColumn = useMemo(() => groupColumnFor(source, parsed.headers), [source, parsed.headers])

  const sourceRows = useMemo(
    () =>
      fillDown && groupColumn
        ? fillDownByGroup(parsed.rows, parsed.headers, groupColumn)
        : parsed.rows,
    [fillDown, groupColumn, parsed.headers, parsed.rows],
  )

  const result = useMemo(() => {
    if (rules.length === 0) return null
    return convertRows(sourceRows, rules, target)
  }, [sourceRows, rules, target])

  const outputCsv = useMemo(
    () => (result && result.rows.length > 0 ? toCsv(result.headers, result.rows) : ''),
    [result],
  )

  const mappedSources = new Set(rules.map((r) => r.source).filter(Boolean))
  const unmapped = parsed.headers.filter((h) => !mappedSources.has(h))

  useSeo({
    title: `Marketplace CSV Converter — Shopify ↔ Amazon ↔ eBay ↔ Etsy ↔ WooCommerce | ${SITE.name}`,
    description:
      'Convert product CSVs between Shopify, Amazon flat file, Amazon Inventory Loader, eBay File Exchange, Etsy and WooCommerce. Sensible default column mapping you can edit, then download the converted file. Free, no upload, runs in your browser.',
    path: '/tools/marketplace-csv-converter',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Marketplace CSV / flat-file converter',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any modern browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Client-side converter that maps product CSV columns between Shopify, Amazon, eBay, Etsy and WooCommerce schemas.',
    },
  })

  function updateRule(index: number, patch: Partial<MappingRule>) {
    setRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)))
  }

  function readFile(file: File) {
    setFileError('')
    if (file.size > 25 * 1024 * 1024) {
      setFileError('That file is larger than 25 MB. Split it and convert in batches.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setRaw(String(reader.result ?? ''))
    reader.onerror = () => setFileError('Could not read that file.')
    reader.readAsText(file)
  }

  const sampleForSource = SAMPLES[sourceId]

  return (
    <div className="wrap page">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / Marketplace CSV converter
      </p>

      <h1>Marketplace CSV / flat-file converter</h1>
      <p className="lede muted" style={{ maxWidth: '68ch' }}>
        Paste or open a product CSV, pick where it is coming from and where it is going, adjust the
        column mapping if you want, and download the converted file. Everything happens in this tab —
        your catalogue is never uploaded.
      </p>

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === 'convert'}
          onClick={() => setTab('convert')}
        >
          Convert a file
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === 'headers'}
          onClick={() => setTab('headers')}
        >
          Schema headers
        </button>
      </div>

      <section className="card section" style={{ marginTop: 0 }}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="source-platform">Source platform</label>
            <select
              id="source-platform"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="target-platform">Target platform</label>
            <select
              id="target-platform"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="hint">
          {source.name} → {target.name}. Column reference:{' '}
          <Link to={`/schemas/${source.id}`}>{source.name}</Link> ·{' '}
          <Link to={`/schemas/${target.id}`}>{target.name}</Link>
        </p>
      </section>

      {tab === 'headers' ? (
        <HeaderView sourceId={sourceId} targetId={targetId} />
      ) : (
        <>
          <section className="section">
            <h2>1. Your {source.name} data</h2>
            <div
              className={`dropzone${dragging ? ' over' : ''}`}
              onClick={() => fileInput.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInput.current?.click()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const file = e.dataTransfer.files[0]
                if (file) readFile(file)
              }}
              role="button"
              tabIndex={0}
            >
              Drop a .csv file here, or click to choose one — it is read locally, never uploaded.
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,text/csv,text/plain"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) readFile(file)
                e.target.value = ''
              }}
            />

            {fileError && (
              <div className="notice notice-error">
                <p>{fileError}</p>
              </div>
            )}

            <div className="field" style={{ marginTop: '1rem' }}>
              <label htmlFor="csv-input">…or paste CSV rows including the header row</label>
              <textarea
                id="csv-input"
                rows={8}
                placeholder="Handle,Title,Variant SKU,Variant Price,..."
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
              />
            </div>

            <div className="btn-row">
              {sampleForSource && (
                <button type="button" className="btn btn-sm" onClick={() => setRaw(sampleForSource)}>
                  Load sample {source.name} data
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setRaw('')}
                disabled={!raw}
              >
                Clear
              </button>
              {parsed.rows.length > 0 && (
                <span className="small muted">
                  {parsed.rows.length} row{parsed.rows.length === 1 ? '' : 's'} ·{' '}
                  {parsed.headers.length} columns detected
                </span>
              )}
            </div>

            {parsed.errors.length > 0 && (
              <div className="notice notice-warn">
                <p>
                  <strong>CSV parser notes:</strong> {parsed.errors.join(' · ')}
                </p>
              </div>
            )}

            {groupColumn && (
              <p className="hint">
                <label style={{ display: 'inline-flex', gap: '0.45rem', fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    checked={fillDown}
                    onChange={(e) => setFillDown(e.target.checked)}
                  />
                  Fill blank shared fields down within each <code>{groupColumn}</code> group —{' '}
                  {source.name} repeats a product across rows and leaves title, description and
                  vendor blank after the first variant.
                </label>
              </p>
            )}

            {raw.trim() && parsed.headers.length > 0 && unmapped.length > 0 && (
              <p className="hint">
                Not carried over to {target.name}: {unmapped.join(', ')}. Point a target
                column at any of these below if you need them.
              </p>
            )}
          </section>

          <section className="section">
            <h2>2. Column mapping</h2>
            <p className="small muted">
              Defaults match fields that mean the same thing on both platforms. Change any row — pick
              a different source column, apply a transform, or type a fixed value used when the
              source is empty.
            </p>
            <div className="btn-row" style={{ marginBottom: '0.9rem' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setRules(defaultMapping(source, target, parsed.headers))}
              >
                Reset to defaults
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() =>
                  setRules((prev) => prev.map((r) => ({ ...r, source: '', transform: 'none' })))
                }
              >
                Clear all sources
              </button>
            </div>

            <div className="table-scroll">
              <table className="map-table">
                <thead>
                  <tr>
                    <th scope="col">{target.name} column</th>
                    <th scope="col">From {source.name} column</th>
                    <th scope="col">Transform</th>
                    <th scope="col">Fixed / fallback value</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, index) => {
                    const column = target.columns.find((c) => c.name === rule.target)
                    return (
                      <tr key={rule.target}>
                        <td className="map-target">
                          {rule.target}
                          {column?.required && <span className="req"> *</span>}
                        </td>
                        <td>
                          <select
                            aria-label={`Source column for ${rule.target}`}
                            value={rule.source}
                            onChange={(e) => updateRule(index, { source: e.target.value })}
                          >
                            <option value="">— none —</option>
                            {parsed.headers.map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            aria-label={`Transform for ${rule.target}`}
                            value={rule.transform}
                            onChange={(e) =>
                              updateRule(index, { transform: e.target.value as TransformId })
                            }
                          >
                            {TRANSFORMS.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            aria-label={`Fixed value for ${rule.target}`}
                            value={rule.constant}
                            placeholder="—"
                            onChange={(e) => updateRule(index, { constant: e.target.value })}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <h2>3. Converted {target.name} CSV</h2>

            {!raw.trim() && (
              <div className="notice">
                <p>Paste or open a CSV above and the converted file appears here.</p>
              </div>
            )}

            {result && result.rows.length > 0 && (
              <>
                {result.emptyRequired.length > 0 && (
                  <div className="notice notice-warn">
                    <p>
                      <strong>Required columns still empty:</strong>{' '}
                      {result.emptyRequired.join(', ')}. {target.name} will most likely reject these
                      rows until you map them or set a fixed value.
                    </p>
                  </div>
                )}

                <div className="btn-row" style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => downloadText(`${target.id}-converted.csv`, outputCsv)}
                  >
                    Download {target.id}-converted.csv
                  </button>
                  <CopyButton className="btn" label="Copy CSV" text={outputCsv} />
                  <span className="small muted">
                    {result.rows.length} rows · {result.headers.length} columns
                  </span>
                </div>

                <h3>Preview (first {Math.min(PREVIEW_ROWS, result.rows.length)} rows)</h3>
                <div className="table-scroll">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {result.headers.map((header) => (
                          <th key={header} scope="col">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                        <tr key={i}>
                          {result.headers.map((header) => (
                            <td key={header} title={row[header]}>
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}

      <section className="section wrap-narrow" style={{ padding: 0 }}>
        <h2>What the converter does and does not do</h2>
        <p>
          It renames columns, applies the value transforms you choose, and fills in fixed values —
          deterministically. Run it twice on the same input and you get byte-identical output.
        </p>
        <ul>
          <li>
            <strong>It does not</strong> invent eBay category IDs or Amazon <code>feed_product_type</code>{' '}
            values. Those are platform-specific taxonomies — set them as a fixed value per batch.
          </li>
          <li>
            <strong>It does not</strong> restructure variation families. Shopify's handle-grouped
            variants and Amazon's parent/child SKUs are different shapes; convert one product family
            at a time if you rely on variations.
          </li>
          <li>
            <strong>It does not</strong> validate against live catalogue data. If a row is rejected
            after upload, run the code through the{' '}
            <Link to="/tools/amazon-error-decode">error decoder</Link>.
          </li>
        </ul>
        <p className="small muted">
          Not affiliated with Shopify, Amazon, eBay, Etsy or WooCommerce. Always keep the original
          file and test a small batch first.
        </p>
      </section>
    </div>
  )
}

function HeaderView({ sourceId, targetId }: { sourceId: string; targetId: string }) {
  const shown = PLATFORMS.filter((p) => p.id === sourceId || p.id === targetId)

  return (
    <section className="section">
      <h2>Exact columns each platform expects</h2>
      <p className="small muted">
        Header-only reference for the two platforms selected above. Copy the row straight into a
        blank spreadsheet, or see the{' '}
        <Link to="/schemas">full reference with notes for every platform</Link>.
      </p>
      <div className="stack">
        {shown.map((platform) => {
          const headers = platformHeaders(platform)
          const csv = toCsv(headers, []).trim()
          return (
            <div key={platform.id} className="card">
              <h3 style={{ marginBottom: '0.25rem' }}>{platform.name}</h3>
              <p className="small muted">
                {platform.file} · {headers.length} columns
              </p>
              <textarea readOnly rows={3} value={csv} />
              <div className="btn-row" style={{ marginTop: '0.75rem' }}>
                <CopyButton label="Copy header row" text={csv} />
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => downloadText(`${platform.id}-headers.csv`, `${csv}\n`)}
                >
                  Download blank CSV
                </button>
                <Link className="btn btn-sm" to={`/schemas/${platform.id}`}>
                  Field notes
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
