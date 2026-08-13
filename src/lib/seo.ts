import { useEffect } from 'react'
import { SITE, absoluteUrl } from './site'

export interface SeoOptions {
  title: string
  description: string
  path: string
  /** Comma-separated meta keywords (optional; baked into static HTML by prerender too). */
  keywords?: string
  /** JSON-LD object graph rendered into a script tag. */
  jsonLd?: unknown
  noIndex?: boolean
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Keeps head tags in sync on client-side navigation. The build step also bakes
 * the same tags into a static HTML file per route, so crawlers that do not run
 * JavaScript still get the right title, description and canonical.
 */
export function useSeo({ title, description, path, keywords, jsonLd, noIndex }: SeoOptions) {
  // Pages build their JSON-LD inline, so compare by value instead of identity.
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const url = absoluteUrl(path)
    document.title = title

    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, follow' : 'index, follow')
    if (keywords) setMeta('meta[name="keywords"]', 'name', 'keywords', keywords)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE.name)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    const previous = document.getElementById('route-jsonld')
    if (previous) previous.remove()
    if (jsonLdText) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'route-jsonld'
      script.textContent = jsonLdText
      document.head.appendChild(script)
    }
  }, [title, description, keywords, path, jsonLdText, noIndex])
}
