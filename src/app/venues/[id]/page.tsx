import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ExternalLink, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/events/EventCard'
import type { Venue, EventWithVenue } from '@/types'

export const revalidate = 3600

interface PageProps {
  params: { id: string }
}

async function getVenueWithEvents(id: string): Promise<{ venue: Venue; events: EventWithVenue[] } | null> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [venueRes, eventsRes] = await Promise.all([
    supabase.from('venues').select('*').eq('id', id).single(),
    supabase
      .from('events')
      .select('*, venue:venues(*)')
      .eq('venue_id', id)
      .eq('status', 'active')
      .gte('date', today)
      .order('date', { ascending: true }),
  ])

  if (venueRes.error || !venueRes.data) return null
  return {
    venue: venueRes.data,
    events: (eventsRes.data ?? []) as EventWithVenue[],
  }
}

export default async function VenueDetailPage({ params }: PageProps) {
  const result = await getVenueWithEvents(params.id)
  if (!result) notFound()

  const { venue, events } = result

  return (
    <div className="space-y-8">
      <Link href="/venues" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft size={14} /> 会場一覧に戻る
      </Link>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-zinc-500 mt-1 shrink-0" />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">{venue.name}</h1>
            {venue.name_en && <p className="text-zinc-500">{venue.name_en}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
          <span>{venue.area}</span>
          {venue.address && <span>{venue.address}</span>}
          {venue.capacity && <span>キャパ: {venue.capacity}人</span>}
        </div>
        {venue.website_url && (
          <a
            href={venue.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            公式サイト <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">今後のイベント</h2>
        {events.length === 0 ? (
          <p className="text-zinc-500 py-8 text-center">現在登録されているイベントはありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
