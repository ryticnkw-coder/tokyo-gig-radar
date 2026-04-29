import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Venue } from '@/types'

export const revalidate = 86400

async function getVenues(): Promise<Venue[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('area')
    .order('name')
  if (error) throw error
  return data ?? []
}

export default async function VenuesPage() {
  const venues = await getVenues()

  const byArea = venues.reduce<Record<string, Venue[]>>((acc, venue) => {
    if (!acc[venue.area]) acc[venue.area] = []
    acc[venue.area].push(venue)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">会場一覧</h1>
      {Object.entries(byArea).map(([area, areaVenues]) => (
        <section key={area} className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">{area}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {areaVenues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"
              >
                <MapPin size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">{venue.name}</p>
                  {venue.name_en && <p className="text-xs text-zinc-500">{venue.name_en}</p>}
                  {venue.capacity && <p className="text-xs text-zinc-600 mt-1">キャパ: {venue.capacity}人</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {venues.length === 0 && (
        <p className="text-zinc-500 py-16 text-center">会場データがありません</p>
      )}
    </div>
  )
}
