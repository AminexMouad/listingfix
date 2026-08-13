import data from '../data/platforms.json'

export interface PlatformColumn {
  name: string
  canonical?: string
  required?: boolean
  note?: string
}

export interface Platform {
  id: string
  name: string
  file: string
  summary: string
  notes: string[]
  columns: PlatformColumn[]
}

export const PLATFORMS = data as Platform[]

const BY_ID = new Map(PLATFORMS.map((p) => [p.id, p]))

export function getPlatform(id: string | undefined): Platform | undefined {
  if (!id) return undefined
  return BY_ID.get(id)
}

export function platformHeaders(platform: Platform): string[] {
  return platform.columns.map((c) => c.name)
}
