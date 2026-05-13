export function formatCurrency(value: number, options: { withSign?: boolean } = {}): string {
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('zh-Hant-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(abs)

  if (options.withSign) {
    if (value > 0) return `+${formatted}`
    if (value < 0) return `-${formatted}`
  }
  return value < 0 ? `-${formatted}` : formatted
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-Hant-TW').format(value)
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${(value * 100).toFixed(fractionDigits)}%`
}
