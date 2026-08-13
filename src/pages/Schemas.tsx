import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { SITE, absoluteUrl } from '../lib/site'
import { PLATFORMS } from '../lib/platforms'

export default function Schemas() {
  useSeo({
    title: `Marketplace CSV Column Reference — Shopify, Amazon, eBay, Etsy, WooCommerce | ${SITE.name}`,
    description:
      'The exact CSV columns each marketplace expects: Shopify product CSV, Amazon flat file and Inventory Loader, eBay File Exchange, Etsy listings export and the WooCommerce product importer. Free reference with required fields marked.',
    path: '/schemas',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Marketplace CSV schemas',
      itemListElement: PLATFORMS.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`/schemas/${p.id}`),
        name: `${p.name} CSV columns`,
      })),
    },
  })

  return (
    <div className="wrap page">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / Schema reference
      </p>

      <h1>Marketplace CSV column reference</h1>
      <p className="lede muted" style={{ maxWidth: '68ch' }}>
        What columns does each platform actually expect? These are header-only reference sheets —
        the field names, which ones are required, and the gotchas that cause most rejected uploads.
        Download the headers as a blank CSV to start a file from scratch.
      </p>

      <section className="section">
        <div className="grid-2">
          {PLATFORMS.map((platform) => (
            <article key={platform.id} className="tool-card">
              <h2 style={{ fontSize: '1.15rem' }}>
                <Link to={`/schemas/${platform.id}`}>{platform.name}</Link>
              </h2>
              <p className="small muted" style={{ marginBottom: '0.25rem' }}>
                {platform.file} · {platform.columns.length} columns
              </p>
              <p className="small">{platform.summary}</p>
              <Link className="btn btn-sm" to={`/schemas/${platform.id}`}>
                View columns
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap-narrow" style={{ padding: 0 }}>
        <h2>Why schemas differ so much</h2>
        <p>
          Every marketplace models a product slightly differently. Shopify treats a variant as a row
          and groups them by handle. Amazon treats a variation as a parent SKU with child SKUs and a
          declared variation theme. eBay flattens everything into one listing row with item specifics
          as extra columns. WooCommerce mirrors Shopify's shape but with human-readable headers and
          1/0 booleans.
        </p>
        <p>
          That is why a straight column rename is never quite enough. The{' '}
          <Link to="/tools/marketplace-csv-converter">CSV converter</Link> handles the renaming and
          the obvious value transforms; the structural differences — variation families, category
          IDs, required category attributes — still need a human decision.
        </p>
        <p className="small muted">
          Column lists are compiled from public platform documentation and real export files. They
          change without notice; verify against a freshly downloaded template before a large upload.
        </p>
      </section>
    </div>
  )
}
