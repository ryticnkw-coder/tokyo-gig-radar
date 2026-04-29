'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const AREAS = ['渋谷', '新宿', '下北沢', '恵比寿', '六本木', '代官山', '中目黒']

export default function EventFiltersBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="アーティスト・イベント名で検索"
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => updateParam('search', e.target.value)}
        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-60"
      />
      <input
        type="date"
        defaultValue={searchParams.get('dateFrom') ?? ''}
        onChange={(e) => updateParam('dateFrom', e.target.value)}
        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
      />
      <span className="text-zinc-600 text-sm">〜</span>
      <input
        type="date"
        defaultValue={searchParams.get('dateTo') ?? ''}
        onChange={(e) => updateParam('dateTo', e.target.value)}
        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
      />
      <select
        defaultValue={searchParams.get('area') ?? ''}
        onChange={(e) => updateParam('area', e.target.value)}
        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
      >
        <option value="">エリア: すべて</option>
        {AREAS.map((area) => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={searchParams.get('touring') === 'true'}
          onChange={(e) => updateParam('touring', e.target.checked ? 'true' : '')}
          className="accent-indigo-500"
        />
        来日公演のみ
      </label>
    </div>
  )
}
