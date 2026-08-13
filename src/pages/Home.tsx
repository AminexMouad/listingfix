import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { SITE } from '../lib/site'
import { AMAZON_ERRORS } from '../lib/errors'
import { PLATFORMS } from '../lib/platforms'

const POPULAR = ['8541', '8016', '5665', '8555', '8105', '99007', '13013', '6024']

export default function Home() {
  useSeo({
    title: `${SITE.name} — Amazon Error Code Decoder & Marketplace CSV Converter`,
    description:
      'Free browser-based listing file toolkit for ecommerce sellers. Decode Amazon flat-file error codes in plain English and convert product CSVs between Shopify, Amazon, eBay, Etsy and WooCommerce. No sign-up, no upload.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: SITE.name,
          url: SITE.url,
          description: SITE.description,
        },
        {
          '@type': 'WebApplication',
          name: `${SITE.name} — ${SITE.tagline}`,
          url: SITE.url,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any modern browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          featureList: [
            'Amazon flat-file error code decoder',
            'Marketplace product CSV converter',
            'Platform column schema reference',
          ],
        },
      ],
    },
  })

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">100% in your browser · free · no sign-up</span>
          <h1>Fix your listing files without guessing</h1>
          <p className="lede">
            {SITE.name} is a free {SITE.tagline.toLowerCase()} for ecommerce sellers. Decode cryptic
            Amazon flat-file error codes into plain English, and convert product CSVs between
            Shopify, Amazon, eBay, Etsy and WooCommerce — all locally, with nothing uploaded
            anywhere.
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" to="/tools/amazon-error-decode">
              Decode an Amazon error
            </Link>
            <Link className="btn" to="/tools/marketplace-csv-converter">
              Convert a product CSV
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap page">
        <section className="section">
          <h2>Two tools, one toolkit</h2>
          <div className="grid-2">
            <article className="tool-card">
              <h2>
                <Link to="/tools/amazon-error-decode">Amazon flat-file error decoder</Link>
              </h2>
              <p className="muted small">
                Paste your processing report or type a code. Get the meaning, the likely cause and a
                numbered fix.
              </p>
              <ul>
                <li>{AMAZON_ERRORS.length} documented codes and growing</li>
                <li>Search by number or by keyword (&ldquo;upc&rdquo;, &ldquo;variation&rdquo;)</li>
                <li>Paste a whole report — every known code in it is picked out</li>
              </ul>
              <Link className="btn btn-primary" to="/tools/amazon-error-decode">
                Open the decoder
              </Link>
              <Link className="btn" to="/amazon-errors/">
                Browse by category
              </Link>
            </article>

            <article className="tool-card">
              <h2>
                <Link to="/tools/marketplace-csv-converter">Marketplace CSV converter</Link>
              </h2>
              <p className="muted small">
                Move product data between marketplaces without hand-rebuilding a spreadsheet.
              </p>
              <ul>
                <li>{PLATFORMS.length} schemas: Shopify, Amazon ×2, eBay, Etsy, WooCommerce</li>
                <li>Sensible default column mapping for every pair, fully editable</li>
                <li>Download or copy the converted CSV instantly</li>
              </ul>
              <Link className="btn btn-primary" to="/tools/marketplace-csv-converter">
                Open the converter
              </Link>
            </article>
          </div>
        </section>

        <section className="section">
          <h2>Common Amazon error codes</h2>
          <p className="muted small">
            The codes sellers hit most often. See{' '}
            <Link to="/tools/amazon-error-decode">all {AMAZON_ERRORS.length} codes</Link>.
          </p>
          <div className="chip-row">
            {POPULAR.map((code) => (
              <Link key={code} className="chip" to={`/amazon-error/${code}`}>
                Error {code}
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Why it is different</h2>
          <div className="grid-3">
            <div className="card card-soft">
              <h3>Nothing leaves your machine</h3>
              <p className="small muted">
                Parsing and conversion happen in JavaScript on your device. No upload, no server, no
                retention. Works offline once the page has loaded.
              </p>
            </div>
            <div className="card card-soft">
              <h3>Deterministic, not AI</h3>
              <p className="small muted">
                The converter is a plain mapping engine. The same input and mapping always produce
                the same output — no hallucinated columns, no surprise edits to your data.
              </p>
            </div>
            <div className="card card-soft">
              <h3>Free, no account</h3>
              <p className="small muted">
                No sign-up, no trial, no row limits, no watermark. Bookmark the error code page you
                need and come back to it.
              </p>
            </div>
          </div>
        </section>

        <section className="section wrap-narrow" style={{ padding: 0 }}>
          <h2>Questions</h2>
          <dl className="faq">
            <dt>Is my product data uploaded anywhere?</dt>
            <dd>
              No. Both tools run entirely client-side. The CSV you paste or open never leaves the
              browser tab, and closing the tab discards it.
            </dd>
            <dt>Do I need an Amazon, Shopify or eBay account connected?</dt>
            <dd>
              No. There is no API integration and no OAuth. You bring a file, you get a file back.
            </dd>
            <dt>Are the error explanations official?</dt>
            <dd>
              No. They are practitioner explanations of what each code usually means and how sellers
              usually clear it. Amazon changes validation rules regularly, so treat the processing
              report and Seller Central documentation as the source of truth.
            </dd>
            <dt>Will the converted CSV upload cleanly first time?</dt>
            <dd>
              Usually it gets you 90% of the way. Category-specific required fields, category IDs and
              product-type values still need your input — the converter tells you which required
              columns came out empty.
            </dd>
          </dl>
        </section>
      </div>
    </>
  )
}
