import { createClient } from '@/lib/supabase/server'
import type { EventFilters, EventWithVenue } from '@/types'

export async function getEvents(filters: EventFilters = {}): Promise<EventWithVenue[]> {
  const supabase = createClient()

  let query = supabase
    .from('events')
    .select(`
      *,
      venue:venues(*)
    `)
    .eq('status', 'active')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (filters.dateFrom) {
    query = query.gte('date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('date', filters.dateTo)
  }
  if (filters.venueId) {
    query = query.eq('venue_id', filters.venueId)
  }
  if (filters.isTouring !== undefined) {
    query = query.eq('is_touring', filters.isTouring)
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }
  if (filters.area) {
    query = query.eq('venue.area', filters.area)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as EventWithVenue[]
}

export async function getEventById(id: string): Promise<EventWithVenue | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venue:venues(*),
      event_artists(
        is_headliner,
        artist:artists(*)
      )
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error) return null
  return data as EventWithVenue
}

export async function getUpcomingEvents(limit = 6): Promise<EventWithVenue[]> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select(`*, venue:venues(*)`)
    .eq('status', 'active')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as EventWithVenue[]
}

export async function getTouringEvents(limit = 6): Promise<EventWithVenue[]> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select(`*, venue:venues(*)`)
    .eq('status', 'active')
    .eq('is_touring', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as EventWithVenue[]
}
