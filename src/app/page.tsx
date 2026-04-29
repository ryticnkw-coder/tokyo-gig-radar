import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import EventCard from '@/components/events/EventCard'
import { getUpcomingEvents, getTouringEvents } from '@/lib/events'

export const revalidate = 3600

export default async function HomePage() {
  const [upcoming, touring] = await Promise.all([
    getUpcomingEvents(6),
    getTouringEvents(3),
  ])

  return (
    <div className="space-y-12">
      <section className="py-8 text-center space-y-3">
        <h1 className="text-3xl font-bold text-white">Tokyo Gig Radar</h1>
        <p className="text-zinc-400 text-lg">東京のインディー・クラブ系ライブ情報＆来日公演をまとめてチェック</p>
      </section>

      {touring.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">来日公演 ピックアップ</h2>
            <Link href="/touring" className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
              すべて見る <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {touring.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">近日開催のイベント</h2>
          <Link href="/events" className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
            すべて見る <ArrowRight size={14} />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-zinc-500 py-8 text-center">現在登録されているイベントはありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
