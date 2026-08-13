import config from '../../site.config.json'

export const SITE = config

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`
  return `${SITE.url}${path === '/' ? '/' : path}`
}
