import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Ticket, ExternalLink, ArrowLeft } from 'lucide-react'
import { getEventById } from '@/lib/events'
import { formatDateLong, formatTime, formatPrice } from '@/lib/utils'

export const revalidate = 3600

interface PageProps {
  params: { id: string }
}

export default async function EventDetailPage({ params }: PageProps) {
  const event = await getEventById(params.id)
  if (!event) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/events" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft size={14} /> イベント一覧に戻る
      </Link>

      {event.image_url && (
        <div className="relative h-64 w-full rounded-lg overflow-hidden bg-zinc-800">
          <Image src={event.image_url} alt={event.title} fill className="object-cover" />
        </div>
      )}

      <div className="space-y-4">
        {event.is_touring && (
          <span className="inline-block text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            来日公演
          </span>
        )}
        <h1 className="text-2xl font-bold text-white">{event.title}</h1>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-zinc-300">
            <Clock size={15} className="text-zinc-500" />
            <span>{formatDateLong(event.date)}</span>
            {event.open_time && <span>OPEN {formatTime(event.open_time)}</span>}
            {event.start_time && <span>START {formatTime(event.start_time)}</span>}
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <MapPin size={15} className="text-zinc-500" />
            <Link href={`/venues/${event.venue_id}`} className="hover:text-white underline underline-offset-2">
              {event.venue.name}
            </Link>
            <span className="text-zinc-500">({event.venue.area})</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Ticket size={15} className="text-zinc-500" />
            <span>{formatPrice(event.price_min, event.price_max)}</span>
          </div>
        </div>

        {event.ticket_url && (
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            チケットを購入 <ExternalLink size={14} />
          </a>
        )}

        {event.description && (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {event.source_url && (
          <div className="border-t border-zinc-800 pt-4">
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400"
            >
              情報元を見る <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
