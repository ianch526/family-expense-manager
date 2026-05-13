import { storage } from './storage'
import type { Budget, BudgetStat } from '@/types'
import { uniqueId, budgetStatus } from '@/utils/calcStats'
import { monthRange } from '@/utils/formatDate'

export const budgetService = {
  list: async (yearMonth: string): Promise<Budget[]> => {
    return storage.getBudgets().filter((b) => b.yearMonth === yearMonth)
  },

  /**
   * 批次更新月份預算（PUT /budgets）
   * data: [{ categoryId, amount }]
   */
  upsertMany: async (
    yearMonth: string,
    data: { categoryId: string; amount: number }[],
  ): Promise<Budget[]> => {
    const all = storage.getBudgets()
    const remaining = all.filter((b) => b.yearMonth !== yearMonth)
    const next: Budget[] = data
      .filter((d) => d.amount > 0)
      .map((d) => {
        const existing = all.find(
          (b) => b.yearMonth === yearMonth && b.categoryId === d.categoryId,
        )
        return {
          id: existing?.id ?? uniqueId('budget'),
          yearMonth,
          amount: d.amount,
          categoryId: d.categoryId,
        }
      })
    storage.setBudgets([...remaining, ...next])
    return next
  },

  overview: async (yearMonth: string): Promise<BudgetStat[]> => {
    const { from, to } = monthRange(yearMonth)
    const categories = storage.getCategories()
    const budgets = storage.getBudgets().filter((b) => b.yearMonth === yearMonth)
    const tx = storage
      .getTransactions()
      .filter((t) => t.date >= from && t.date <= to && t.type === 'EXPENSE')

    return budgets
      .map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId)
        if (!category) return null
        const spent = tx
          .filter((t) => t.categoryId === budget.categoryId)
          .reduce((s, t) => s + t.amount, 0)
        const usageRate = budget.amount > 0 ? spent / budget.amount : 0
        return {
          budget,
          category,
          spent,
          usageRate,
          status: budgetStatus(usageRate),
        }
      })
      .filter((x): x is BudgetStat => x !== null)
      .sort((a, b) => b.usageRate - a.usageRate)
  },
}
