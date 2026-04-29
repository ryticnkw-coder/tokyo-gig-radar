import { chromium } from 'playwright'
import { parseJapaneseDate, parseTime, parsePrice } from '../lib/dateParser.js'
import type { Scraper, ScrapedEvent } from './types.js'

const BASE_URL = 'https://www.liquidroom.net'
const SCHEDULE_URL = `${BASE_URL}/schedule`

export const liquidroomScraper: Scraper = {
  name: 'liquidroom',

  async run(): Promise<ScrapedEvent[]> {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    const events: ScrapedEvent[] = []

    try {
      await page.goto(SCHEDULE_URL, { waitUntil: 'networkidle', timeout: 30000 })

      // イベントカードのセレクタ（実際のHTMLに合わせて調整が必要な場合あり）
      const items = await page.$$('.schedule-list__item, .event-list__item, article.event')

      for (const item of items) {
        try {
          const titleEl = await item.$('.event-title, .schedule-title, h2, h3')
          const title = (await titleEl?.textContent())?.trim()
          if (!title) continue

          const dateEl = await item.$('.event-date, .schedule-date, time, .date')
          const dateRaw = (await dateEl?.textContent())?.trim() ?? ''
          const date = parseJapaneseDate(dateRaw)
          if (!date) continue

          // 過去イベントはスキップ
          if (date < new Date().toISOString().split('T')[0]) continue

          const linkEl = await item.$('a')
          const href = await linkEl?.getAttribute('href')
          const source_url = href
            ? href.startsWith('http') ? href : `${BASE_URL}${href}`
            : SCHEDULE_URL

          // 時刻
          const timeEl = await item.$('.event-time, .schedule-time, .time')
          const timeRaw = (await timeEl?.textContent()) ?? ''
          const openMatch = timeRaw.match(/open[:\s]*(\d{1,2}:\d{2})/i)
          const startMatch = timeRaw.match(/start[:\s]*(\d{1,2}:\d{2})/i)

          // 価格
          const priceEl = await item.$('.event-price, .price, .adm')
          const priceRaw = (await priceEl?.textContent()) ?? ''
          const priceNums = priceRaw.match(/[\d,]+/g)?.map(n => parseInt(n.replace(',', ''), 10)) ?? []

          // 画像
          const imgEl = await item.$('img')
          const image_url = await imgEl?.getAttribute('src') ?? undefined

          events.push({
            title,
            date,
            open_time: openMatch ? parseTime(openMatch[1]) ?? undefined : undefined,
            start_time: startMatch ? parseTime(startMatch[1]) ?? undefined : undefined,
            price_min: priceNums[0],
            price_max: priceNums[1] ?? priceNums[0],
            source_url,
            source_site: 'liquidroom',
            is_touring: false,
            venue_name: 'LIQUIDROOM',
            image_url,
          })
        } catch (e) {
          // 個別イベントのパースエラーは続行
        }
      }
    } finally {
      await browser.close()
    }

    return events
  },
}
