import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'M月d日(EEE)', { locale: ja })
}

export function formatDateLong(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年M月d日(EEE)', { locale: ja })
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

export function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return '料金未定'
  if (min && max && min !== max) return `¥${min.toLocaleString()} 〜 ¥${max.toLocaleString()}`
  const price = min ?? max!
  return `¥${price.toLocaleString()}`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
