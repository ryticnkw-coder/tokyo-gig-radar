import { supabase } from './supabase.js'
import type { ScrapedEvent, SourceSite } from '../scrapers/types.js'

// 会場名→IDのキャッシュ
const venueCache = new Map<string, string>()

async function resolveVenueId(venueName: string): Promise<string | null> {
  if (venueCache.has(venueName)) return venueCache.get(venueName)!

  // 完全一致で検索
  const { data } = await supabase
    .from('venues')
    .select('id')
    .ilike('name', venueName)
    .limit(1)
    .single()

  if (data) {
    venueCache.set(venueName, data.id)
    return data.id
  }

  // 部分一致で再検索（例: "LIQUIDROOM" → "恵比寿LIQUIDROOM"）
  const { data: partial } = await supabase
    .from('venues')
    .select('id, name')
    .ilike('name', `%${venueName}%`)
    .limit(1)
    .single()

  if (partial) {
    venueCache.set(venueName, partial.id)
    return partial.id
  }

  // 見つからなければ新規作成（エリアはunknownで仮登録）
  const { data: created } = await supabase
    .from('venues')
    .insert({ name: venueName, area: '未分類' })
    .select('id')
    .single()

  if (created) {
    venueCache.set(venueName, created.id)
    console.warn(`  [venue] 新規作成: ${venueName}`)
    return created.id
  }

  return null
}

export interface UpsertResult {
  added: number
  skipped: number
}

export async function upsertEvents(events: ScrapedEvent[]): Promise<UpsertResult> {
  let added = 0
  let skipped = 0

  for (const event of events) {
    const venueId = await resolveVenueId(event.venue_name)
    if (!venueId) {
      console.warn(`  [skip] 会場解決失敗: ${event.venue_name}`)
      skipped++
      continue
    }

    // source_url で重複チェック（同じURLなら更新しない）
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('source_url', event.source_url)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase.from('events').insert({
      title: event.title,
      venue_id: venueId,
      date: event.date,
      open_time: event.open_time ?? null,
      start_time: event.start_time ?? null,
      price_min: event.price_min ?? null,
      price_max: event.price_max ?? null,
      ticket_url: event.ticket_url ?? null,
      description: event.description ?? null,
      image_url: event.image_url ?? null,
      source_url: event.source_url,
      source_site: event.source_site,
      is_touring: event.is_touring,
      status: 'active',
    })

    if (error) {
      console.error(`  [error] ${event.title}: ${error.message}`)
      skipped++
    } else {
      added++
    }
  }

  return { added, skipped }
}

export async function logScrape(
  sourceSite: SourceSite,
  status: 'success' | 'partial' | 'error',
  eventsFound: number,
  eventsAdded: number,
  errorMessage?: string
) {
  await supabase.from('scrape_logs').insert({
    source_site: sourceSite,
    status,
    events_found: eventsFound,
    events_added: eventsAdded,
    error_message: errorMessage ?? null,
  })
}
