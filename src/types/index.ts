export type EventStatus = 'active' | 'cancelled' | 'draft'
export type SourceSite = 'iflyer' | 'liquidroom' | 'wwwtokyo' | 'unit' | 'smash' | 'manual'

export interface Venue {
  id: string
  name: string
  name_en: string | null
  area: string
  address: string | null
  capacity: number | null
  website_url: string | null
  scrape_url: string | null
}

export interface Artist {
  id: string
  name: string
  name_en: string | null
  country: string | null
  genre: string[] | null
}

export interface Event {
  id: string
  title: string
  venue_id: string
  date: string
  open_time: string | null
  start_time: string | null
  price_min: number | null
  price_max: number | null
  ticket_url: string | null
  description: string | null
  image_url: string | null
  source_url: string | null
  source_site: SourceSite | null
  is_touring: boolean
  status: EventStatus
  created_at: string
  updated_at: string
  venue?: Venue
  artists?: Artist[]
}

export interface EventWithVenue extends Event {
  venue: Venue
}

export interface ScrapeLog {
  id: string
  source_site: SourceSite
  status: 'success' | 'partial' | 'error'
  events_found: number | null
  events_added: number | null
  error_message: string | null
  executed_at: string
}

export interface EventFilters {
  dateFrom?: string
  dateTo?: string
  area?: string
  venueId?: string
  isTouring?: boolean
  search?: string
}
