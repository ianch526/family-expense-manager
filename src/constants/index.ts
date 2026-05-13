// 設計規格 9.1：Chart Palette（10 色）
export const COLOR_PALETTE = [
  { color: '#1D9E75', light: '#DCF3EA' },
  { color: '#378ADD', light: '#DCEAF8' },
  { color: '#D85A30', light: '#FCE3D7' },
  { color: '#EF9F27', light: '#FCEBCD' },
  { color: '#E24B4A', light: '#FBDADA' },
  { color: '#7F77DD', light: '#E5E2F8' },
  { color: '#888780', light: '#E8E8E5' },
  { color: '#D4537E', light: '#F8DDE6' },
  { color: '#639922', light: '#E1EFCE' },
  { color: '#BA7517', light: '#F4E4CC' },
] as const

// Budget 警示閾值
export const BUDGET_WARN_THRESHOLD = 0.7
export const BUDGET_DANGER_THRESHOLD = 0.9

// 預設分類
export const DEFAULT_CATEGORIES = [
  { name: '飲食', color: '#D85A30', light: '#FCE3D7', icon: 'utensils' },
  { name: '交通', color: '#378ADD', light: '#DCEAF8', icon: 'car' },
  { name: '居家', color: '#7F77DD', light: '#E5E2F8', icon: 'home' },
  { name: '娛樂', color: '#EF9F27', light: '#FCEBCD', icon: 'gamepad' },
  { name: '教育', color: '#1D9E75', light: '#DCF3EA', icon: 'book' },
  { name: '醫療', color: '#E24B4A', light: '#FBDADA', icon: 'heart' },
  { name: '其他', color: '#888780', light: '#E8E8E5', icon: 'tag' },
]

// 預設成員
export const DEFAULT_MEMBERS = [
  { name: '爸爸', color: '#0F6E56', light: '#E1F5EE' },
  { name: '媽媽', color: '#D4537E', light: '#F8DDE6' },
]

export const STORAGE_KEYS = {
  CATEGORIES: 'fea:categories',
  MEMBERS: 'fea:members',
  TRANSACTIONS: 'fea:transactions',
  BUDGETS: 'fea:budgets',
  INITIALIZED: 'fea:initialized',
} as const
