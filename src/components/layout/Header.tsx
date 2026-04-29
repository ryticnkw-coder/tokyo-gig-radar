'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/events', label: 'イベント' },
  { href: '/venues', label: '会場' },
  { href: '/touring', label: '来日公演' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Tokyo Gig Radar
        </Link>
        <nav className="flex gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded text-sm transition-colors',
                pathname.startsWith(href)
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
