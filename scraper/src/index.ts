import { iflyerScraper } from './scrapers/iflyer.js'
import { liquidroomScraper } from './scrapers/liquidroom.js'
import { wwwTokyoScraper } from './scrapers/wwwtokyo.js'
import { upsertEvents, logScrape } from './lib/upsert.js'
import type { Scraper } from './scrapers/types.js'

const ALL_SCRAPERS: Scraper[] = [
  iflyerScraper,
  liquidroomScraper,
  wwwTokyoScraper,
]

async function runScraper(scraper: Scraper) {
  console.log(`\n[${scraper.name}] 開始...`)
  const start = Date.now()

  try {
    const events = await scraper.run()
    console.log(`[${scraper.name}] ${events.length}件取得`)

    const { added, skipped } = await upsertEvents(events)
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`[${scraper.name}] 完了: 新規${added}件 / スキップ${skipped}件 (${elapsed}s)`)

    await logScrape(scraper.name, 'success', events.length, added)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[${scraper.name}] エラー: ${message}`)
    await logScrape(scraper.name, 'error', 0, 0, message)
  }
}

async function main() {
  const target = process.argv[2]

  const scrapers = target
    ? ALL_SCRAPERS.filter(s => s.name === target)
    : ALL_SCRAPERS

  if (scrapers.length === 0) {
    console.error(`不明なスクレイパー: ${target}`)
    console.error(`使用可能: ${ALL_SCRAPERS.map(s => s.name).join(', ')}`)
    process.exit(1)
  }

  for (const scraper of scrapers) {
    await runScraper(scraper)
  }

  console.log('\n全スクレイパー完了')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
