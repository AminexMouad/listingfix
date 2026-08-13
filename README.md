# ListingFile — Listing File Toolkit

A free, privacy-first listing file toolkit for ecommerce sellers. Two tools on one static site:

**A. Amazon flat-file error decoder** — paste an error code, a keyword, or a whole processing
report and get a plain-English explanation, the likely cause and a numbered fix. 32 curated codes,
each with its own indexable page at `/amazon-error/<code>`.

**B. Marketplace CSV / flat-file converter** — paste or open a product CSV, pick a source and
target platform (Shopify, Amazon flat file, Amazon Inventory Loader, eBay File Exchange, Etsy,
WooCommerce), adjust the column mapping, and download the converted CSV. Plus a header-only schema
reference for every platform at `/schemas/<platform>`.

Everything runs **100% in the browser**. No backend, no accounts, no API calls, no file uploads.
Deterministic JavaScript only — the same input and mapping always produce the same output.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check, bundle, then prerender routes + sitemap into dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Stack

- Vite + React 19 + TypeScript
- `react-router-dom` for routing
- `papaparse` for CSV parsing and encoding
- No CSS framework — one hand-written stylesheet in `src/index.css`

## Layout

```
index.html                  shared <head>, incl. the single GA4 snippet
site.config.json            site name, canonical URL, description (used by app + prerender)
samples/                    demo fixtures, imported into the app with ?raw
src/data/amazonErrors.json  the error-code database (single source of truth)
src/data/platforms.json     per-platform CSV column schemas
src/lib/                    errors search, mapping engine, CSV helpers, SEO hook
src/pages/                  one file per route
scripts/prerender.mjs       post-build: per-route static HTML + sitemap.xml
```

## SEO notes

The app is a SPA, but `npm run build` runs `scripts/prerender.mjs`, which writes a static
`dist/<route>/index.html` for every route with its own `<title>`, meta description, canonical,
OG/Twitter tags, JSON-LD and a `<noscript>` content block. `vercel.json` rewrites everything else
to `/index.html`; Vercel checks the filesystem first, so the prerendered files win for their own
paths. `useSeo()` keeps the same tags correct during client-side navigation.

`sitemap.xml` is generated from the same route list, so adding an error code to
`src/data/amazonErrors.json` automatically produces a new page, a new sitemap entry and a new
prerendered HTML file.

## Deploy

Static site — build command `npm run build`, output directory `dist`. `vercel.json` handles the SPA
rewrite. No environment variables, no secrets.

## Adding an error code

Append an object to `src/data/amazonErrors.json`:

```json
{
  "code": "1234",
  "title": "Short description of the failure",
  "severity": "blocking | error | warning",
  "category": "one of the existing category strings",
  "cause": "What actually went wrong, in plain English.",
  "fix": ["Step one.", "Step two."],
  "keywords": ["searchable", "terms"],
  "related": ["8541"]
}
```

Nothing else needs touching — the list page, the search, the detail route, the sitemap and the
prerendered HTML all derive from that file.

## Disclaimer

Not affiliated with, endorsed by or sponsored by Amazon, eBay, Etsy, Shopify or WooCommerce. Error
explanations and column schemas are community-maintained interpretations compiled from public
documentation and real export files; both change without notice. Verify against the official
platform documentation and your own processing report before acting.

## Licence

MIT
