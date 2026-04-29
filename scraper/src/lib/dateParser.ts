// "2026年4月29日" or "2026.04.29" or "04/29" → "YYYY-MM-DD"
export function parseJapaneseDate(raw: string, fallbackYear?: number): string | null {
  const year = fallbackYear ?? new Date().getFullYear()

  // 2026年4月29日
  const fullJp = raw.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/)
  if (fullJp) {
    return `${fullJp[1]}-${fullJp[2].padStart(2, '0')}-${fullJp[3].padStart(2, '0')}`
  }

  // 4月29日 (year from context)
  const shortJp = raw.match(/(\d{1,2})月\s*(\d{1,2})日/)
  if (shortJp) {
    return `${year}-${shortJp[1].padStart(2, '0')}-${shortJp[2].padStart(2, '0')}`
  }

  // 2026.04.29 or 2026/04/29
  const dotSlash = raw.match(/(\d{4})[./](\d{1,2})[./](\d{1,2})/)
  if (dotSlash) {
    return `${dotSlash[1]}-${dotSlash[2].padStart(2, '0')}-${dotSlash[3].padStart(2, '0')}`
  }

  // 04/29 or 4.29
  const short = raw.match(/(\d{1,2})[./](\d{1,2})/)
  if (short) {
    return `${year}-${short[1].padStart(2, '0')}-${short[2].padStart(2, '0')}`
  }

  return null
}

// "OPEN 18:00 / START 19:00" など様々な形式から時刻を抽出
export function parseTime(raw: string): string | null {
  const m = raw.match(/(\d{1,2}):(\d{2})/)
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

// "¥3,000" "3000円" "3,000" などから数値を抽出
export function parsePrice(raw: string): number | null {
  const cleaned = raw.replace(/[¥,円\s]/g, '').replace(/[^\d]/g, '')
  const n = parseInt(cleaned, 10)
  return isNaN(n) ? null : n
}
