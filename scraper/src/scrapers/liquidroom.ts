import { chromium } from 'playwright'
import { parseTime } from '../lib/dateParser.js'
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

      const items = await page.$$('article')

      for (const item of items) {
        try {
          const titleEl = await item.$('h2')
          const title = (await titleEl?.textContent())?.trim()
          if (!title) continue

          const linkEl = await item.$('a.s_link')
          const href = await linkEl?.getAttribute('href')
          if (!href) continue
          const source_url = href.startsWith('http') ? href : `${BASE_URL}${href}`

          // 日付をURLから抽出: .../slug_20260401 → "2026-04-01"
          const dateMatch = href.match(/(\d{4})(\d{2})(\d{2})$/)
          if (!dateMatch) continue
          const date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`

          if (date < new Date().toISOString().split('T')[0]) continue

          let open_time: string | undefined
          let start_time: string | undefined
          let price_min: number | undefined
          let price_max: number | undefined

          const dls = await item.$$('dl.clear')
          for (const dl of dls) {
            const dtEl = await dl.$('dt')
            const ddEl = await dl.$('dd')
            const dt = (await dtEl?.textContent())?.trim()
            const dd = (await ddEl?.textContent())?.trim() ?? ''

            if (dt === 'OPEN') open_time = parseTime(dd) ?? undefined
            else if (dt === 'START') start_time = parseTime(dd) ?? undefined
            else if (dt === 'ADV') {
              const nums = (dd.match(/[\d,]+/g) ?? [])
                .map(n => parseInt(n.replace(/,/g, ''), 10))
                .filter(n => n >= 100)
              if (nums.length > 0) {
                price_min = Math.min(...nums)
                price_max = Math.max(...nums)
              }
            }
          }

          const imgEl = await item.$('div.left img')
          const image_url = (await imgEl?.getAttribute('src')) ?? undefined

          events.push({
            title,
            date,
            open_time,
            start_time,
            price_min,
            price_max,
            source_url,
            source_site: 'liquidroom',
            is_touring: false,
            venue_name: 'LIQUIDROOM',
            image_url,
          })
        } catch {
          // 個別イベントのパースエラーは続行
        }
      }
    } finally {
      await browser.close()
    }

    return events
  },
}
