import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Ticket } from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'
import type { EventWithVenue } from '@/types'

interface EventCardProps {
  event: EventWithVenue
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors"
    >
      {event.image_url && (
        <div className="relative h-40 w-full bg-zinc-800">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        {event.is_touring && (
          <span className="inline-block text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            来日公演
          </span>
        )}
        <p className="text-sm text-zinc-400">{formatDate(event.date)}</p>
        <h3 className="text-white font-semibold leading-snug line-clamp-2">{event.title}</h3>
        <div className="space-y-1 text-sm text-zinc-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} />
            <span>{event.venue.name}</span>
            <span className="text-zinc-700">·</span>
            <span>{event.venue.area}</span>
          </div>
          {event.start_time && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>OPEN {formatTime(event.open_time)} / START {formatTime(event.start_time)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Ticket size={13} />
            <span>{formatPrice(event.price_min, event.price_max)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
