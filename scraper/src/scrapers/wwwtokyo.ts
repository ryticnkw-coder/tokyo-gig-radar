import { chromium } from 'playwright'
import { parseJapaneseDate, parseTime } from '../lib/dateParser.js'
import type { Scraper, ScrapedEvent } from './types.js'

const BASE_URL = 'https://www-shibuya.jp'
const SCHEDULE_URL = `${BASE_URL}/schedule/`

export const wwwTokyoScraper: Scraper = {
  name: 'wwwtokyo',

  async run(): Promise<ScrapedEvent[]> {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    const events: ScrapedEvent[] = []

    try {
      await page.goto(SCHEDULE_URL, { waitUntil: 'networkidle', timeout: 30000 })

      const items = await page.$$('.schedule-item, .event-item, article, .event')

      for (const item of items) {
        try {
          const titleEl = await item.$('h2, h3, .event-name, .title')
          const title = (await titleEl?.textContent())?.trim()
          if (!title) continue

          const dateEl = await item.$('.date, time, .event-date')
          const dateRaw = (await dateEl?.textContent())?.trim() ?? ''
          const date = parseJapaneseDate(dateRaw)
          if (!date) continue

          if (date < new Date().toISOString().split('T')[0]) continue

          const linkEl = await item.$('a')
          const href = await linkEl?.getAttribute('href')
          const source_url = href
            ? href.startsWith('http') ? href : `${BASE_URL}${href}`
            : SCHEDULE_URL

          const timeEl = await item.$('.time, .open-start')
          const timeRaw = (await timeEl?.textContent()) ?? ''
          const openMatch = timeRaw.match(/open[:\s]*(\d{1,2}:\d{2})/i)
          const startMatch = timeRaw.match(/start[:\s]*(\d{1,2}:\d{2})/i)

          const priceEl = await item.$('.price, .adm, .charge')
          const priceRaw = (await priceEl?.textContent()) ?? ''
          const priceNums = priceRaw.match(/[\d,]+/g)?.map(n => parseInt(n.replace(',', ''), 10)) ?? []

          const imgEl = await item.$('img')
          const image_url = await imgEl?.getAttribute('src') ?? undefined

          // 会場名（WWWとWWW Xで分岐）
          const venueEl = await item.$('.venue, .place')
          const venueRaw = (await venueEl?.textContent())?.trim()
          const venue_name = venueRaw?.includes('X') ? 'WWW X' : 'WWW'

          events.push({
            title,
            date,
            open_time: openMatch ? parseTime(openMatch[1]) ?? undefined : undefined,
            start_time: startMatch ? parseTime(startMatch[1]) ?? undefined : undefined,
            price_min: priceNums[0],
            price_max: priceNums[1] ?? priceNums[0],
            source_url,
            source_site: 'wwwtokyo',
            is_touring: false,
            venue_name,
            image_url,
          })
        } catch (e) {
          // continue
        }
      }
    } finally {
      await browser.close()
    }

    return events
  },
}
