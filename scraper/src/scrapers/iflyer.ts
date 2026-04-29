import { chromium } from 'playwright'
import { parseJapaneseDate, parseTime, parsePrice } from '../lib/dateParser.js'
import type { Scraper, ScrapedEvent } from './types.js'

const BASE_URL = 'https://iflyer.tv'
// ジャンル絞り込みはURLパラメータで対応可能
const LIST_URLS = [
  `${BASE_URL}/ja/guide/tokyo/`,
  `${BASE_URL}/ja/guide/tokyo/?genre=club`,
]

// 海外アーティストの判定（is_touring）
const FOREIGN_KEYWORDS = ['tour', 'japan tour', 'japan edition', 'live in tokyo', 'live in japan']
function detectTouring(title: string): boolean {
  const lower = title.toLowerCase()
  return FOREIGN_KEYWORDS.some(k => lower.includes(k))
}

export const iflyerScraper: Scraper = {
  name: 'iflyer',

  async run(): Promise<ScrapedEvent[]> {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    const eventsMap = new Map<string, ScrapedEvent>()

    try {
      for (const url of LIST_URLS) {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

        // iflyer のイベントカードセレクタ
        const items = await page.$$('.event-card, .EventCard, [class*="event-list"] li, .guide-event-item')

        for (const item of items) {
          try {
            const titleEl = await item.$('.event-name, .EventCard__title, h3, h2')
            const title = (await titleEl?.textContent())?.trim()
            if (!title) continue

            const dateEl = await item.$('.event-date, .EventCard__date, .date, time')
            const dateRaw = (await dateEl?.textContent())?.trim() ?? ''
            const date = parseJapaneseDate(dateRaw)
            if (!date) continue

            if (date < new Date().toISOString().split('T')[0]) continue

            const linkEl = await item.$('a')
            const href = await linkEl?.getAttribute('href')
            if (!href) continue
            const source_url = href.startsWith('http') ? href : `${BASE_URL}${href}`

            // 重複排除
            if (eventsMap.has(source_url)) continue

            const venueEl = await item.$('.venue-name, .EventCard__venue, .venue')
            const venue_name = (await venueEl?.textContent())?.trim() ?? '不明'

            const timeEl = await item.$('.time, .EventCard__time')
            const timeRaw = (await timeEl?.textContent()) ?? ''
            const openMatch = timeRaw.match(/open[:\s]*(\d{1,2}:\d{2})/i)
            const startMatch = timeRaw.match(/start[:\s]*(\d{1,2}:\d{2})/i)

            const priceEl = await item.$('.price, .EventCard__price, .adm')
            const priceRaw = (await priceEl?.textContent()) ?? ''
            const priceNums = priceRaw.match(/[\d,]+/g)?.map(n => parseInt(n.replace(',', ''), 10)) ?? []

            const imgEl = await item.$('img')
            const imgSrc = await imgEl?.getAttribute('src')
            const image_url = imgSrc && !imgSrc.includes('placeholder') ? imgSrc : undefined

            eventsMap.set(source_url, {
              title,
              date,
              open_time: openMatch ? parseTime(openMatch[1]) ?? undefined : undefined,
              start_time: startMatch ? parseTime(startMatch[1]) ?? undefined : undefined,
              price_min: priceNums[0],
              price_max: priceNums[1] ?? priceNums[0],
              source_url,
              source_site: 'iflyer',
              is_touring: detectTouring(title),
              venue_name,
              image_url,
            })
          } catch (e) {
            // continue
          }
        }

        // レート制限: サイトへの負荷を避ける
        await page.waitForTimeout(3000)
      }
    } finally {
      await browser.close()
    }

    return Array.from(eventsMap.values())
  },
}
