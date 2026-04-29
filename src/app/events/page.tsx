import { Suspense } from 'react'
import EventCard from '@/components/events/EventCard'
import EventFiltersBar from '@/components/events/EventFiltersBar'
import { getEvents } from '@/lib/events'
import type { EventFilters } from '@/types'

export const revalidate = 3600

interface PageProps {
  searchParams: {
    search?: string
    dateFrom?: string
    dateTo?: string
    area?: string
    touring?: string
  }
}

export default async function EventsPage({ searchParams }: PageProps) {
  const filters: EventFilters = {
    search: searchParams.search,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    area: searchParams.area,
    isTouring: searchParams.touring === 'true' ? true : undefined,
  }

  const events = await getEvents(filters)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">イベント一覧</h1>
      <Suspense>
        <EventFiltersBar />
      </Suspense>
      {events.length === 0 ? (
        <p className="text-zinc-500 py-16 text-center">該当するイベントが見つかりませんでした</p>
      ) : (
        <>
          <p className="text-sm text-zinc-500">{events.length}件のイベント</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
