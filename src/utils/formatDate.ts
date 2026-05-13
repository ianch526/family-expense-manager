import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function formatDate(iso: string, pattern = 'MM/dd'): string {
  try {
    return format(parseISO(iso), pattern, { locale: zhTW })
  } catch {
    return iso
  }
}

export function formatLongDate(iso: string): string {
  return formatDate(iso, 'yyyy-MM-dd (eee)')
}

export function monthRange(yearMonth: string): { from: string; to: string } {
  const [y, m] = yearMonth.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function lastNMonths(n: number, baseYearMonth?: string): string[] {
  const base = baseYearMonth
    ? new Date(`${baseYearMonth}-01`)
    : new Date()
  const result: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    result.push(format(subMonths(base, i), 'yyyy-MM'))
  }
  return result
}

export function formatYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-')
  return `${y}年${parseInt(m, 10)}月`
}

export function shortMonth(yearMonth: string): string {
  const [, m] = yearMonth.split('-')
  return `${parseInt(m, 10)}月`
}
