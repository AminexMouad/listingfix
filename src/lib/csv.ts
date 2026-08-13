import Papa from 'papaparse'

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
  errors: string[]
}

export function parseCsv(text: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  })

  const headers = (result.meta.fields ?? []).filter((h) => h !== '')
  const rows = (result.data ?? []).map((row) => {
    const clean: Record<string, string> = {}
    for (const header of headers) clean[header] = row[header] ?? ''
    return clean
  })

  const errors = result.errors
    .filter((e) => e.code !== 'TooFewFields' && e.code !== 'TooManyFields')
    .slice(0, 5)
    .map((e) => (typeof e.row === 'number' ? `Row ${e.row + 1}: ${e.message}` : e.message))

  return { headers, rows, errors }
}

export function toCsv(headers: string[], rows: Record<string, string>[]): string {
  return Papa.unparse({ fields: headers, data: rows.map((r) => headers.map((h) => r[h] ?? '')) })
}

export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
