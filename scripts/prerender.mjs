/**
 * Post-build step: bake per-route <head> tags (title, description, canonical,
 * OG/Twitter, JSON-LD) plus a <noscript> content block into a static HTML file
 * for every route, and emit sitemap.xml.
 *
 * The app is still a normal SPA — this only makes each route indexable by
 * crawlers that do not execute JavaScript. Vercel checks the filesystem before
 * applying the SPA rewrite, so these files win for their own paths.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const site = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'))
const errors = JSON.parse(readFileSync(join(root, 'src/data/amazonErrors.json'), 'utf8'))
const platforms = JSON.parse(readFileSync(join(root, 'src/data/platforms.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const url = (path) => `${site.url}${path === '/' ? '/' : path}`

function replaceTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html
}

function render({ path, title, description, keywords, jsonLd, body }) {
  let html = template

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  html = replaceTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${esc(description)}" />`,
  )
  if (keywords) {
    html = replaceTag(
      html,
      /<meta\s+name="keywords"[\s\S]*?\/>/,
      `<meta name="keywords" content="${esc(keywords)}" />`,
    )
  }
  html = replaceTag(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${esc(url(path))}" />`,
  )
  html = replaceTag(
    html,
    /<meta property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${esc(title)}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${esc(description)}" />`,
  )
  html = replaceTag(
    html,
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${esc(url(path))}" />`,
  )
  html = replaceTag(
    html,
    /<meta name="twitter:title"[\s\S]*?\/>/,
    `<meta name="twitter:title" content="${esc(title)}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${esc(description)}" />`,
  )

  if (jsonLd) {
    const json = JSON.stringify(jsonLd).replace(/</g, '\\u003c')
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json" id="route-jsonld">${json}</script>\n  </head>`,
    )
  }

  if (body) {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    <noscript>${body}</noscript>`)
  }

  return html
}

function write(path, html) {
  const target = path === '/' ? join(dist, 'index.html') : join(dist, path, 'index.html')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, html)
}

const website = { '@type': 'WebSite', name: site.name, url: site.url }
const routes = []

/* ---------- home ---------- */
routes.push({
  path: '/',
  title: `${site.name} — Amazon Error Code Decoder & Marketplace CSV Converter`,
  description: site.description,
  changefreq: 'weekly',
  priority: '1.0',
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      { ...website, description: site.description },
      {
        '@type': 'WebApplication',
        name: `${site.name} — ${site.tagline}`,
        url: site.url,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any modern browser',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  },
  body: `<h1>${esc(site.name)} — ${esc(site.tagline)}</h1><p>${esc(site.description)}</p>
    <ul>
      <li><a href="/tools/amazon-error-decode">Amazon flat-file error code decoder</a></li>
      <li><a href="/tools/marketplace-csv-converter">Marketplace CSV converter</a></li>
      <li><a href="/schemas">Marketplace CSV column reference</a></li>
    </ul>`,
})

/* ---------- tool A ---------- */
routes.push({
  path: '/tools/amazon-error-decode',
  title: `Amazon Flat-File Error Code Decoder — ${errors.length} Codes Explained | ${site.name}`,
  description:
    'Paste an Amazon flat-file error code or a whole processing report and get a plain-English explanation, the likely cause and step-by-step fix. Covers 8541, 8016, 5665, 8555, 8105, 99007, 13013 and more. Free and fully in-browser.',
  changefreq: 'weekly',
  priority: '0.9',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Amazon flat-file error codes',
    numberOfItems: errors.length,
    itemListElement: errors.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: url(`/amazon-error/${e.code}`),
      name: `Amazon error ${e.code} — ${e.title}`,
    })),
  },
  body: `<h1>Amazon flat-file error code decoder</h1><ul>${errors
    .map(
      (e) =>
        `<li><a href="/amazon-error/${e.code}">Error ${e.code} — ${esc(e.title)}</a></li>`,
    )
    .join('')}</ul>`,
})

/* ---------- tool A: one page per code ---------- */
for (const error of errors) {
  routes.push({
    path: `/amazon-error/${error.code}`,
    title: `How to Fix Amazon Error ${error.code} (${error.title}) — Step-by-Step | ${site.name}`,
    description: `Amazon flat-file error ${error.code} means: ${error.title}. ${error.cause.slice(0, 110)}… Here’s the step-by-step fix to get your listing processing.`,
    keywords: [
      `amazon error ${error.code}`,
      `error ${error.code} amazon`,
      `fix amazon error ${error.code}`,
      `amazon flat file error ${error.code}`,
      ...error.keywords,
    ].join(', '),
    changefreq: 'monthly',
    priority: '0.8',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          headline: `How to fix Amazon flat-file error ${error.code}: ${error.title}`,
          description: error.cause,
          url: url(`/amazon-error/${error.code}`),
          articleSection: error.category,
          keywords: [`amazon error ${error.code}`, ...error.keywords].join(', '),
          isPartOf: website,
        },
        {
          '@type': 'HowTo',
          name: `How to fix Amazon error ${error.code}`,
          description: error.cause,
          step: error.fix.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
        },
      ],
    },
    body: `<h1>Amazon error ${error.code}: ${esc(error.title)}</h1>
      <p>${esc(error.cause)}</p>
      <h2>How to fix error ${error.code}</h2>
      <ol>${error.fix.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
      <p><a href="/tools/amazon-error-decode">All Amazon flat-file error codes</a></p>`,
  })
}

/* ---------- category hub ---------- */
const categories = [...new Set(errors.map((e) => e.category))].sort()
routes.push({
  path: '/amazon-errors/',
  title: `Amazon Flat-File Error Codes by Category — ${errors.length} Code Fixes | ${site.name}`,
  description:
    'Browse Amazon flat-file error codes grouped by category — brand, product type, duplicate & matching, feed format, images, identifiers, pricing and more. Each code has a plain-English explanation and a step-by-step fix. Free.',
  keywords:
    'amazon flat file errors, amazon product upload errors, amazon inventory errors, amazon error codes list, amazon catalog errors by category, fix amazon listing errors',
  changefreq: 'monthly',
  priority: '0.8',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Amazon flat-file error codes by category',
    numberOfItems: errors.length,
    itemListElement: errors.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: url(`/amazon-error/${e.code}`),
      name: `How to fix Amazon error ${e.code} — ${e.title}`,
    })),
  },
  body: `<h1>Amazon flat-file error codes by category</h1>${categories
    .map(
      (cat) =>
        `<h2>${esc(cat)}</h2><ul>${errors
          .filter((e) => e.category === cat)
          .map((e) => `<li><a href="/amazon-error/${e.code}">Error ${e.code} — ${esc(e.title)}</a></li>`)
          .join('')}</ul>`,
    )
    .join('')}`,
})

/* ---------- tool B + schemas ---------- */
routes.push({
  path: '/tools/marketplace-csv-converter',
  title: `Marketplace CSV Converter — Shopify ↔ Amazon ↔ eBay ↔ Etsy ↔ WooCommerce | ${site.name}`,
  description:
    'Convert product CSVs between Shopify, Amazon flat file, Amazon Inventory Loader, eBay File Exchange, Etsy and WooCommerce. Sensible default column mapping you can edit, then download the converted file. Free, no upload, runs in your browser.',
  changefreq: 'weekly',
  priority: '0.9',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Marketplace CSV / flat-file converter',
    url: url('/tools/marketplace-csv-converter'),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any modern browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  body: `<h1>Marketplace CSV / flat-file converter</h1>
    <p>Convert product CSV files between marketplace schemas in your browser.</p>
    <ul>${platforms.map((p) => `<li><a href="/schemas/${p.id}">${esc(p.name)} columns</a></li>`).join('')}</ul>`,
})

routes.push({
  path: '/schemas',
  title: `Marketplace CSV Column Reference — Shopify, Amazon, eBay, Etsy, WooCommerce | ${site.name}`,
  description:
    'The exact CSV columns each marketplace expects: Shopify product CSV, Amazon flat file and Inventory Loader, eBay File Exchange, Etsy listings export and the WooCommerce product importer. Free reference with required fields marked.',
  changefreq: 'monthly',
  priority: '0.7',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Marketplace CSV schemas',
    itemListElement: platforms.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: url(`/schemas/${p.id}`),
      name: `${p.name} CSV columns`,
    })),
  },
  body: `<h1>Marketplace CSV column reference</h1><ul>${platforms
    .map((p) => `<li><a href="/schemas/${p.id}">${esc(p.name)} — ${p.columns.length} columns</a></li>`)
    .join('')}</ul>`,
})

for (const platform of platforms) {
  const required = platform.columns.filter((c) => c.required).length
  routes.push({
    path: `/schemas/${platform.id}`,
    title: `${platform.name} CSV Columns — Full Field List & Required Fields | ${site.name}`,
    description: `The complete ${platform.name} CSV column list (${platform.file}): all ${platform.columns.length} fields, which ${required} are required, and notes on the formats that cause failed uploads. Copy or download the headers free.`,
    keywords: `${platform.name} csv columns, ${platform.name} csv template, ${platform.file}, ${platform.name} required fields, ${platform.name} product import`,
    changefreq: 'monthly',
    priority: '0.6',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: `${platform.name} CSV column reference`,
      description: platform.summary,
      url: url(`/schemas/${platform.id}`),
      isPartOf: website,
    },
    body: `<h1>${esc(platform.name)} CSV columns</h1><p>${esc(platform.summary)}</p>
      <ul>${platform.columns.map((c) => `<li>${esc(c.name)}${c.required ? ' (required)' : ''}</li>`).join('')}</ul>`,
  })
}

routes.push({
  path: '/privacy',
  title: `Privacy, Disclaimer & How It Works | ${site.name}`,
  description: `How ${site.name} handles your data: everything runs client-side in your browser, no files are uploaded, no account is required. Includes the trademark disclaimer and accuracy notes.`,
  changefreq: 'yearly',
  priority: '0.3',
  body: `<h1>Privacy, disclaimer and how it works</h1>
    <p>${esc(site.name)} runs entirely in your browser. Files are never uploaded and nothing is stored.</p>
    <p>Not affiliated with Amazon, eBay, Etsy, Shopify or WooCommerce.</p>`,
})

for (const route of routes) {
  write(route.path, render(route))
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) =>
      `  <url><loc>${esc(url(r.path))}</loc><changefreq>${r.changefreq ?? 'monthly'}</changefreq><priority>${r.priority ?? '0.5'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

console.log(`prerender: ${routes.length} routes + sitemap.xml`)
