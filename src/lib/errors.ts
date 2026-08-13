import data from '../data/amazonErrors.json'

export type Severity = 'blocking' | 'error' | 'warning'

export interface AmazonError {
  code: string
  title: string
  severity: Severity
  category: string
  cause: string
  fix: string[]
  keywords: string[]
  related: string[]
}

export const AMAZON_ERRORS = data as AmazonError[]

export const ERROR_CATEGORIES = [...new Set(AMAZON_ERRORS.map((e) => e.category))].sort()

const BY_CODE = new Map(AMAZON_ERRORS.map((e) => [e.code, e]))

export function getError(code: string | undefined): AmazonError | undefined {
  if (!code) return undefined
  return BY_CODE.get(code.trim())
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  blocking: 'Blocking',
  error: 'Error',
  warning: 'Warning',
}

export const SEVERITY_HINT: Record<Severity, string> = {
  blocking: 'The row is rejected outright — nothing is created or updated until you fix it.',
  error: 'The row fails validation. Other rows in the same file can still process.',
  warning: 'The feed processes, but part of what you submitted was ignored or downgraded.',
}

/**
 * Pull anything that looks like an error code out of a pasted processing report.
 * Sellers paste whole log lines, so we look for standalone 2-7 digit runs.
 */
export function extractCodes(text: string): string[] {
  const found = new Set<string>()
  for (const match of text.matchAll(/\d{2,7}/g)) {
    if (BY_CODE.has(match[0])) found.add(match[0])
  }
  return [...found]
}

export interface SearchHit {
  error: AmazonError
  score: number
}

/**
 * Deterministic fuzzy-ish ranking: exact code beats code prefix beats title
 * beats keyword beats body text. No index, no dependency — 30 entries is tiny.
 */
export function searchErrors(rawQuery: string): SearchHit[] {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return AMAZON_ERRORS.map((error) => ({ error, score: 0 }))

  const terms = query.split(/\s+/).filter(Boolean)
  const hits: SearchHit[] = []

  for (const error of AMAZON_ERRORS) {
    let score = 0
    const haystack = `${error.title} ${error.cause} ${error.fix.join(' ')} ${error.category}`.toLowerCase()
    const keywords = error.keywords.join(' ').toLowerCase()

    for (const term of terms) {
      if (error.code === term) score += 1000
      else if (error.code.startsWith(term)) score += 400
      else if (error.code.includes(term)) score += 150

      if (error.title.toLowerCase().includes(term)) score += 60
      if (keywords.includes(term)) score += 40
      if (error.category.toLowerCase().includes(term)) score += 20
      if (haystack.includes(term)) score += 10
    }

    if (score > 0) hits.push({ error, score })
  }

  return hits.sort((a, b) => b.score - a.score || a.error.code.localeCompare(b.error.code))
}
