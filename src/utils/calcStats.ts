import { BUDGET_DANGER_THRESHOLD, BUDGET_WARN_THRESHOLD } from '@/constants'

export function budgetStatus(usageRate: number): 'safe' | 'warn' | 'danger' {
  if (usageRate >= BUDGET_DANGER_THRESHOLD) return 'danger'
  if (usageRate >= BUDGET_WARN_THRESHOLD) return 'warn'
  return 'safe'
}

export function budgetColor(status: 'safe' | 'warn' | 'danger'): string {
  switch (status) {
    case 'safe':
      return '#1D9E75'
    case 'warn':
      return '#EF9F27'
    case 'danger':
      return '#E24B4A'
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function uniqueId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function firstChar(name: string): string {
  return name.trim().slice(0, 1) || '?'
}
