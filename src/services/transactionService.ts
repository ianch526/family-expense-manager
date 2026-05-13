import { storage } from './storage'
import type {
  Transaction,
  TransactionFilters,
  TransactionFormData,
  MonthlySummary,
} from '@/types'
import { uniqueId } from '@/utils/calcStats'
import { monthRange } from '@/utils/formatDate'

function applyFilters(items: Transaction[], filters: TransactionFilters): Transaction[] {
  let result = [...items]
  if (filters.dateFrom) result = result.filter((t) => t.date >= filters.dateFrom!)
  if (filters.dateTo) result = result.filter((t) => t.date <= filters.dateTo!)
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    const set = new Set(filters.categoryIds)
    result = result.filter((t) => set.has(t.categoryId))
  }
  if (filters.memberIds && filters.memberIds.length > 0) {
    const set = new Set(filters.memberIds)
    result = result.filter((t) => set.has(t.memberId))
  }
  if (filters.type && filters.type !== 'ALL') {
    result = result.filter((t) => t.type === filters.type)
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        (t.note ?? '').toLowerCase().includes(kw),
    )
  }
  switch (filters.sort) {
    case 'date_asc':
      result.sort((a, b) => a.date.localeCompare(b.date))
      break
    case 'amount_desc':
      result.sort((a, b) => b.amount - a.amount)
      break
    case 'date_desc':
    default:
      result.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }
  return result
}

export const transactionService = {
  list: async (filters: TransactionFilters = {}): Promise<Transaction[]> => {
    return applyFilters(storage.getTransactions(), { sort: 'date_desc', ...filters })
  },
  get: async (id: string): Promise<Transaction | null> => {
    return storage.getTransactions().find((t) => t.id === id) ?? null
  },
  create: async (data: TransactionFormData): Promise<Transaction> => {
    const now = new Date().toISOString()
    const next: Transaction = {
      id: uniqueId('tx'),
      date: data.date,
      name: data.name,
      amount: data.amount,
      type: data.type,
      note: data.note || undefined,
      categoryId: data.categoryId,
      memberId: data.memberId,
      createdAt: now,
      updatedAt: now,
    }
    storage.setTransactions([next, ...storage.getTransactions()])
    return next
  },
  update: async (id: string, data: TransactionFormData): Promise<Transaction> => {
    const list = storage.getTransactions()
    const idx = list.findIndex((t) => t.id === id)
    if (idx < 0) throw new Error('交易不存在')
    const merged: Transaction = {
      ...list[idx],
      date: data.date,
      name: data.name,
      amount: data.amount,
      type: data.type,
      note: data.note || undefined,
      categoryId: data.categoryId,
      memberId: data.memberId,
      updatedAt: new Date().toISOString(),
    }
    list[idx] = merged
    storage.setTransactions(list)
    return merged
  },
  remove: async (id: string): Promise<void> => {
    storage.setTransactions(storage.getTransactions().filter((t) => t.id !== id))
  },
  monthlySummary: async (yearMonth: string): Promise<MonthlySummary> => {
    const { from, to } = monthRange(yearMonth)
    const tx = storage.getTransactions().filter((t) => t.date >= from && t.date <= to)
    const totalIncome = tx
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = tx
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalBudget = storage
      .getBudgets()
      .filter((b) => b.yearMonth === yearMonth)
      .reduce((s, b) => s + b.amount, 0)
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      budgetUsageRate: totalBudget > 0 ? totalExpense / totalBudget : 0,
      totalBudget,
    }
  },
}
