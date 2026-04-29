import { chromium } from 'playwright'
import { parseTime } from '../lib/dateParser.js'
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

      // ページヘッダーから年月を取得: <li class="month"><div class="year">2026</div><a>04</a>
      const year = await page.$eval('li.month .year', el => el.textContent?.trim() ?? '').catch(() => String(new Date().getFullYear()))
      const month = await page.$eval('li.month a', el => el.textContent?.trim().padStart(2, '0') ?? '').catch(() => '')

      const items = await page.$$('article.column')

      for (const item of items) {
        try {
          const titleEl = await item.$('h3.title span')
          const title = (await titleEl?.textContent())?.trim()
          if (!title) continue

          const linkEl = await item.$('a.pageLink')
          const href = await linkEl?.getAttribute('href')
          if (!href) continue
          const source_url = href.startsWith('http') ? href : `${BASE_URL}${href}`

          // 日付: p.day は日数のみ ("01") → ページの年月と結合
          const dayEl = await item.$('p.day')
          const day = (await dayEl?.textContent())?.trim()
          if (!day || !month) continue
          const date = `${year}-${month}-${day.padStart(2, '0')}`

          if (date < new Date().toISOString().split('T')[0]) continue

          // 時刻: "OPEN / START　17:45 / 18:30" → [17:45, 18:30]
          const openStartEl = await item.$('p.openstart')
          const openStartRaw = (await openStartEl?.textContent())?.trim() ?? ''
          const times = openStartRaw.match(/\d{1,2}:\d{2}/g) ?? []

          // 画像: span.image[data-bg] (lazy load のため src は空)
          const imgSpan = await item.$('span.image')
          const image_url = (await imgSpan?.getAttribute('data-bg')) ?? undefined

          // 会場: data-place 属性 ("www_x" → "WWW X", それ以外 → "WWW")
          const dataPlace = await item.getAttribute('data-place')
          const venue_name = dataPlace === 'www_x' ? 'WWW X' : 'WWW'

          events.push({
            title,
            date,
            open_time: times[0] ? parseTime(times[0]) ?? undefined : undefined,
            start_time: times[1] ? parseTime(times[1]) ?? undefined : undefined,
            price_min: undefined,
            price_max: undefined,
            source_url,
            source_site: 'wwwtokyo',
            is_touring: false,
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

    return events
  },
}
