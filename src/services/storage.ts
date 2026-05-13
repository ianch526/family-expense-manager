import { STORAGE_KEYS, DEFAULT_CATEGORIES, DEFAULT_MEMBERS } from '@/constants'
import type { Category, Member, Transaction, Budget } from '@/types'
import { uniqueId } from '@/utils/calcStats'
import { todayISO, currentYearMonth } from '@/utils/formatDate'

/**
 * 模擬 REST API 的 localStorage 後端
 * 介面對應設計規格 §7 API Endpoints
 */

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getCategories: (): Category[] => read<Category[]>(STORAGE_KEYS.CATEGORIES, []),
  setCategories: (data: Category[]) => write(STORAGE_KEYS.CATEGORIES, data),
  getMembers: (): Member[] => read<Member[]>(STORAGE_KEYS.MEMBERS, []),
  setMembers: (data: Member[]) => write(STORAGE_KEYS.MEMBERS, data),
  getTransactions: (): Transaction[] => read<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []),
  setTransactions: (data: Transaction[]) => write(STORAGE_KEYS.TRANSACTIONS, data),
  getBudgets: (): Budget[] => read<Budget[]>(STORAGE_KEYS.BUDGETS, []),
  setBudgets: (data: Budget[]) => write(STORAGE_KEYS.BUDGETS, data),
  isInitialized: (): boolean => read<boolean>(STORAGE_KEYS.INITIALIZED, false),
  markInitialized: () => write(STORAGE_KEYS.INITIALIZED, true),
}

/**
 * 首次啟動時種入預設分類、成員與一些示範交易
 * 讓使用者第一次打開就能看到豐富的 Dashboard 內容
 */
export function ensureSeed(): void {
  if (storage.isInitialized()) return

  const now = new Date().toISOString()

  const categories: Category[] = DEFAULT_CATEGORIES.map((c, i) => ({
    id: uniqueId('cat'),
    name: c.name,
    color: c.color,
    lightColor: c.light,
    icon: c.icon,
    isActive: true,
    sortOrder: i,
  }))

  const members: Member[] = DEFAULT_MEMBERS.map((m) => ({
    id: uniqueId('mem'),
    name: m.name,
    color: m.color,
    lightColor: m.light,
    isActive: true,
  }))

  storage.setCategories(categories)
  storage.setMembers(members)

  // 示範交易：本月若干筆
  const ym = currentYearMonth()
  const today = todayISO()
  const [y, m] = ym.split('-').map(Number)
  const day = (d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const findCat = (name: string) => categories.find((c) => c.name === name)!
  const dad = members[0]
  const mom = members[1]

  const tx: Transaction[] = [
    {
      id: uniqueId('tx'),
      date: day(1),
      name: '月薪入帳',
      amount: 65000,
      type: 'INCOME',
      categoryId: findCat('其他').id,
      memberId: dad.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: day(1),
      name: '月薪入帳',
      amount: 52000,
      type: 'INCOME',
      categoryId: findCat('其他').id,
      memberId: mom.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: day(2),
      name: '全家便當',
      amount: 320,
      type: 'EXPENSE',
      categoryId: findCat('飲食').id,
      memberId: mom.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: day(3),
      name: '加油',
      amount: 1200,
      type: 'EXPENSE',
      categoryId: findCat('交通').id,
      memberId: dad.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: day(4),
      name: '電影票',
      amount: 720,
      type: 'EXPENSE',
      categoryId: findCat('娛樂').id,
      memberId: dad.id,
      note: '週末家庭電影夜',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: day(5),
      name: '超市採買',
      amount: 2580,
      type: 'EXPENSE',
      categoryId: findCat('飲食').id,
      memberId: mom.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: day(6),
      name: '電費',
      amount: 1850,
      type: 'EXPENSE',
      categoryId: findCat('居家').id,
      memberId: dad.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: day(7),
      name: '兒童書籍',
      amount: 980,
      type: 'EXPENSE',
      categoryId: findCat('教育').id,
      memberId: mom.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uniqueId('tx'),
      date: today,
      name: '感冒藥',
      amount: 450,
      type: 'EXPENSE',
      categoryId: findCat('醫療').id,
      memberId: mom.id,
      createdAt: now,
      updatedAt: now,
    },
  ]

  storage.setTransactions(tx)

  // 預算：本月各分類預算
  const budgets: Budget[] = [
    { categoryName: '飲食', amount: 12000 },
    { categoryName: '交通', amount: 4000 },
    { categoryName: '居家', amount: 8000 },
    { categoryName: '娛樂', amount: 3000 },
    { categoryName: '教育', amount: 5000 },
    { categoryName: '醫療', amount: 2000 },
    { categoryName: '其他', amount: 3000 },
  ].map((b) => ({
    id: uniqueId('budget'),
    yearMonth: ym,
    amount: b.amount,
    categoryId: findCat(b.categoryName).id,
  }))

  storage.setBudgets(budgets)
  storage.markInitialized()
}

export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  ensureSeed()
}
