export type SourceSite = 'iflyer' | 'liquidroom' | 'wwwtokyo' | 'unit' | 'smash' | 'manual'

export interface ScrapedEvent {
  title: string
  date: string          // YYYY-MM-DD
  open_time?: string    // HH:MM
  start_time?: string   // HH:MM
  price_min?: number
  price_max?: number
  ticket_url?: string
  description?: string
  image_url?: string
  source_url: string
  source_site: SourceSite
  is_touring: boolean
  venue_name: string    // マッチング用
}

export interface Scraper {
  name: SourceSite
  run(): Promise<ScrapedEvent[]>
}
