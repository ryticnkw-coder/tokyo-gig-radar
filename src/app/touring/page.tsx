import EventCard from '@/components/events/EventCard'
import { getTouringEvents } from '@/lib/events'

export const revalidate = 3600

export default async function TouringPage() {
  const events = await getTouringEvents(50)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">来日公演</h1>
        <p className="text-zinc-500 text-sm">海外アーティストの東京公演をまとめています</p>
      </div>
      {events.length === 0 ? (
        <p className="text-zinc-500 py-16 text-center">現在登録されている来日公演はありません</p>
      ) : (
        <>
          <p className="text-sm text-zinc-500">{events.length}件</p>
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
