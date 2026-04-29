import { chromium } from 'playwright'
import type { Scraper, ScrapedEvent } from './types.js'

const BASE_URL = 'https://iflyer.tv'
const LIST_URL = `${BASE_URL}/listing/events/in_kanto_tokyo`

const FOREIGN_KEYWORDS = ['tour', 'japan tour', 'japan edition', 'live in tokyo', 'live in japan']
function detectTouring(title: string): boolean {
  const lower = title.toLowerCase()
  return FOREIGN_KEYWORDS.some(k => lower.includes(k))
}

// "05.01 (Fri)" → "2026-05-01"
function parseIflyerDate(raw: string): string | null {
  const m = raw.match(/(\d{2})\.(\d{2})/)
  if (!m) return null
  const month = parseInt(m[1], 10)
  const day = parseInt(m[2], 10)
  const today = new Date()
  let year = today.getFullYear()
  if (month < today.getMonth() + 1) year++
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export const iflyerScraper: Scraper = {
  name: 'iflyer',

  async run(): Promise<ScrapedEvent[]> {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    const eventsMap = new Map<string, ScrapedEvent>()

    try {
      await page.goto(LIST_URL, { waitUntil: 'networkidle', timeout: 30000 })

      const items = await page.$$('article')

      for (const item of items) {
        try {
          const linkEl = await item.$('a[href*="/event/"]')
          const href = await linkEl?.getAttribute('href')
          if (!href) continue
          const source_url = href.startsWith('http') ? href : `${BASE_URL}${href}`

          if (eventsMap.has(source_url)) continue

          // タイトル: <h1 myflyer-name="...">
          const titleEl = await item.$('h1[myflyer-name]')
          const title = (await titleEl?.textContent())?.trim()
          if (!title) continue

          // 日付: <div class="nextevent">05.01 (Fri)</div>
          const dateEl = await item.$('div.nextevent')
          const dateRaw = (await dateEl?.textContent())?.trim() ?? ''
          const date = parseIflyerDate(dateRaw)
          if (!date) continue

          if (date < new Date().toISOString().split('T')[0]) continue

          // 会場: <p class="moreinfo"><a>ENTER / Tokyo, Japan</a></p>
          const venueEl = await item.$('p.moreinfo a')
          const venueRaw = (await venueEl?.textContent())?.trim() ?? ''
          const venue_name = venueRaw.split('/')[0]?.trim() || '不明'

          // 画像: <img class="lazy" src="...">
          const imgEl = await item.$('img.lazy')
          const imgSrc = await imgEl?.getAttribute('src')
          const image_url = imgSrc && !imgSrc.includes('placeholder') ? imgSrc : undefined

          eventsMap.set(source_url, {
            title,
            date,
            open_time: undefined,
            start_time: undefined,
            price_min: undefined,
            price_max: undefined,
            source_url,
            source_site: 'iflyer',
            is_touring: detectTouring(title),
            venue_name,
            image_url,
          })
        } catch {
          // 個別イベントのパースエラーは続行
        }
      }
    } finally {
      await browser.close()
    }

    return Array.from(eventsMap.values())
  },
}
