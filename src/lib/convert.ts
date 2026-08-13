import type { Platform, PlatformColumn } from './platforms'

export type TransformId =
  | 'none'
  | 'trim'
  | 'upper'
  | 'lower'
  | 'stripHtml'
  | 'slugify'
  | 'round2'
  | 'gramsToKg'
  | 'kgToGrams'
  | 'firstOfList'
  | 'truncate80'
  | 'truncate140'
  | 'truncate200'

export const TRANSFORMS: { id: TransformId; label: string }[] = [
  { id: 'none', label: 'No change' },
  { id: 'trim', label: 'Trim whitespace' },
  { id: 'upper', label: 'UPPERCASE' },
  { id: 'lower', label: 'lowercase' },
  { id: 'stripHtml', label: 'Strip HTML tags' },
  { id: 'slugify', label: 'Slugify (url-handle)' },
  { id: 'round2', label: 'Round to 2 decimals' },
  { id: 'gramsToKg', label: 'Grams → kilograms' },
  { id: 'kgToGrams', label: 'Kilograms → grams' },
  { id: 'firstOfList', label: 'First value of a comma list' },
  { id: 'truncate80', label: 'Truncate to 80 chars' },
  { id: 'truncate140', label: 'Truncate to 140 chars' },
  { id: 'truncate200', label: 'Truncate to 200 chars' },
]

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max).trimEnd()
}

export function applyTransform(value: string, transform: TransformId): string {
  switch (transform) {
    case 'trim':
      return value.trim()
    case 'upper':
      return value.toUpperCase()
    case 'lower':
      return value.toLowerCase()
    case 'stripHtml':
      return value
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    case 'slugify':
      return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-{2,}/g, '-')
    case 'round2': {
      const n = Number(value.replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? n.toFixed(2) : value
    }
    case 'gramsToKg': {
      const n = Number(value.replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? String(Math.round((n / 1000) * 1000) / 1000) : value
    }
    case 'kgToGrams': {
      const n = Number(value.replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? String(Math.round(n * 1000)) : value
    }
    case 'firstOfList':
      return value.split(',')[0]?.trim() ?? ''
    case 'truncate80':
      return truncate(value, 80)
    case 'truncate140':
      return truncate(value, 140)
    case 'truncate200':
      return truncate(value, 200)
    case 'none':
      return value
  }
}

export interface MappingRule {
  /** Target platform column name. */
  target: string
  /** Source CSV header, or '' to use only the constant. */
  source: string
  /** Used when the source column is missing or the mapped value is empty. */
  constant: string
  transform: TransformId
}

/**
 * Values the target platform wants on every row even though no source column
 * carries them. Sensible, editable starting points — not policy.
 */
export const PLATFORM_DEFAULTS: Record<string, Record<string, string>> = {
  shopify: {
    Published: 'TRUE',
    'Variant Inventory Tracker': 'shopify',
    'Variant Inventory Policy': 'deny',
    'Variant Fulfillment Service': 'manual',
    'Variant Requires Shipping': 'TRUE',
    'Variant Taxable': 'TRUE',
    'Variant Weight Unit': 'g',
    'Image Position': '1',
    'Gift Card': 'FALSE',
    Status: 'active',
  },
  'amazon-flat-file': {
    external_product_id_type: 'UPC',
    condition_type: 'new_new',
    update_delete: 'Update',
    item_weight_unit_of_measure: 'KG',
  },
  'amazon-inventory-loader': {
    'product-id-type': '3',
    'item-condition': '11',
    'fulfillment-center-id': 'DEFAULT',
  },
  ebay: {
    'Action(SiteID=US|Country=US|Currency=USD|Version=1193)': 'Add',
    Format: 'FixedPrice',
    Duration: 'GTC',
    '*ConditionID': '1000',
    ShippingType: 'Flat',
    DispatchTimeMax: '1',
    ReturnsAcceptedOption: 'ReturnsAccepted',
    RefundOption: 'MoneyBack',
    ReturnsWithinOption: 'Days_30',
    ShippingCostPaidByOption: 'Buyer',
  },
  etsy: {
    CURRENCY_CODE: 'USD',
  },
  woocommerce: {
    Type: 'simple',
    Published: '1',
    'Is featured?': '0',
    'Visibility in catalog': 'visible',
    'Tax status': 'taxable',
    'In stock?': '1',
    'Allow customer reviews?': '1',
  },
}

/** Canonical keys that can stand in for one another, with the needed transform. */
const DERIVATIONS: Record<string, { from: string; transform: TransformId }[]> = {
  weight: [{ from: 'weightGrams', transform: 'gramsToKg' }],
  weightGrams: [{ from: 'weight', transform: 'kgToGrams' }],
  handle: [{ from: 'title', transform: 'slugify' }],
  sku: [{ from: 'handle', transform: 'none' }],
  shortDescription: [{ from: 'description', transform: 'stripHtml' }],
  imageMain: [{ from: 'image2', transform: 'none' }],
  price: [{ from: 'salePrice', transform: 'none' }],
  option1Label: [{ from: 'option1Name', transform: 'none' }],
  option2Label: [{ from: 'option2Name', transform: 'none' }],
  productType: [{ from: 'category', transform: 'none' }],
}

/** Target platforms that expect plain text where the source may hold HTML. */
const PLAIN_TEXT_TARGETS = new Set(['etsy', 'ebay', 'amazon-flat-file', 'amazon-inventory-loader'])

const TITLE_LIMITS: Record<string, TransformId> = {
  ebay: 'truncate80',
  etsy: 'truncate140',
  'amazon-flat-file': 'truncate200',
}

/**
 * Build the default rule set for a source→target pair by matching canonical
 * field keys, falling back to derivations and per-platform constants.
 */
export function defaultMapping(
  source: Platform,
  target: Platform,
  availableHeaders: string[],
): MappingRule[] {
  const present = new Set(availableHeaders)
  const byCanonical = new Map<string, PlatformColumn>()
  for (const col of source.columns) {
    if (col.canonical && present.has(col.name) && !byCanonical.has(col.canonical)) {
      byCanonical.set(col.canonical, col)
    }
  }

  const constants = PLATFORM_DEFAULTS[target.id] ?? {}

  return target.columns.map((col) => {
    let sourceName = ''
    let transform: TransformId = 'none'

    if (col.canonical) {
      const direct = byCanonical.get(col.canonical)
      if (direct) {
        sourceName = direct.name
      } else {
        for (const derivation of DERIVATIONS[col.canonical] ?? []) {
          const alt = byCanonical.get(derivation.from)
          if (alt) {
            sourceName = alt.name
            transform = derivation.transform
            break
          }
        }
      }
    }

    if (sourceName && transform === 'none') {
      if (col.canonical === 'description' && PLAIN_TEXT_TARGETS.has(target.id)) transform = 'stripHtml'
      else if (col.canonical === 'title' && TITLE_LIMITS[target.id]) transform = TITLE_LIMITS[target.id]
      else if (col.canonical === 'imageMain' && source.id === 'woocommerce') transform = 'firstOfList'
    }

    return {
      target: col.name,
      source: sourceName,
      constant: constants[col.name] ?? '',
      transform,
    }
  })
}

/**
 * Shopify-style exports repeat a product across rows and leave the shared
 * fields blank after the first one. Carry the last non-empty value forward
 * within a group so every converted row is self-contained.
 */
export function fillDownByGroup(
  rows: Record<string, string>[],
  headers: string[],
  groupColumn: string,
): Record<string, string>[] {
  if (!groupColumn) return rows

  let currentGroup: string | null = null
  let carried: Record<string, string> = {}

  return rows.map((row) => {
    const group = row[groupColumn] ?? ''
    if (group !== currentGroup) {
      currentGroup = group
      carried = {}
    }
    const filled: Record<string, string> = { ...row }
    for (const header of headers) {
      if (header === groupColumn) continue
      if (filled[header] === '' || filled[header] === undefined) {
        if (carried[header]) filled[header] = carried[header]
      } else {
        carried[header] = filled[header]
      }
    }
    return filled
  })
}

/** The column that groups repeated rows of one product, if the source has one. */
export function groupColumnFor(source: Platform, availableHeaders: string[]): string {
  const present = new Set(availableHeaders)
  const column = source.columns.find((c) => c.canonical === 'handle' && present.has(c.name))
  return column?.name ?? ''
}

export interface ConversionResult {
  headers: string[]
  rows: Record<string, string>[]
  /** Target columns marked required by the schema that ended up entirely empty. */
  emptyRequired: string[]
}

export function convertRows(
  rows: Record<string, string>[],
  rules: MappingRule[],
  target: Platform,
): ConversionResult {
  const headers = rules.map((r) => r.target)
  const requiredTargets = new Set(target.columns.filter((c) => c.required).map((c) => c.name))
  const nonEmpty = new Set<string>()

  const out = rows.map((row) => {
    const record: Record<string, string> = {}
    for (const rule of rules) {
      let value = rule.source ? (row[rule.source] ?? '') : ''
      value = applyTransform(String(value), rule.transform)
      if (value === '') value = rule.constant
      if (value !== '') nonEmpty.add(rule.target)
      record[rule.target] = value
    }
    return record
  })

  return {
    headers,
    rows: out,
    emptyRequired: headers.filter((h) => requiredTargets.has(h) && !nonEmpty.has(h)),
  }
}
