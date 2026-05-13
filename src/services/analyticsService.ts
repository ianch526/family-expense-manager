import { storage } from './storage'
import type { CategoryStat, MemberStat } from '@/types'
import { monthRange, lastNMonths } from '@/utils/formatDate'

export const analyticsService = {
  categoryStats: async (yearMonth: string): Promise<CategoryStat[]> => {
    const { from, to } = monthRange(yearMonth)
    const categories = storage.getCategories()
    const tx = storage
      .getTransactions()
      .filter((t) => t.date >= from && t.date <= to && t.type === 'EXPENSE')
    const total = tx.reduce((s, t) => s + t.amount, 0)
    return categories
      .map((category) => {
        const items = tx.filter((t) => t.categoryId === category.id)
        const amount = items.reduce((s, t) => s + t.amount, 0)
        return {
          category,
          amount,
          percentage: total > 0 ? amount / total : 0,
          transactionCount: items.length,
        }
      })
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  },

  memberStats: async (yearMonth: string): Promise<MemberStat[]> => {
    const { from, to } = monthRange(yearMonth)
    const members = storage.getMembers()
    const categories = storage.getCategories()
    const tx = storage
      .getTransactions()
      .filter((t) => t.date >= from && t.date <= to && t.type === 'EXPENSE')
    const total = tx.reduce((s, t) => s + t.amount, 0)
    return members
      .map((member) => {
        const items = tx.filter((t) => t.memberId === member.id)
        const amount = items.reduce((s, t) => s + t.amount, 0)
        const byCategory = categories
          .map((c) => ({
            category: c,
            amount: items.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
          }))
          .filter((x) => x.amount > 0)
        return {
          member,
          amount,
          percentage: total > 0 ? amount / total : 0,
          byCategory,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  },

  /**
   * 近 N 個月每月收入、支出總額（用於 Dashboard 趨勢圖）
   */
  monthlyTrend: async (
    n: number,
    base?: string,
  ): Promise<{ yearMonth: string; income: number; expense: number }[]> => {
    const months = lastNMonths(n, base)
    const all = storage.getTransactions()
    return months.map((ym) => {
      const { from, to } = monthRange(ym)
      const items = all.filter((t) => t.date >= from && t.date <= to)
      return {
        yearMonth: ym,
        income: items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
        expense: items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
      }
    })
  },

  /**
   * 近 N 個月每月各分類支出（前 4 大 + 其他）
   */
  categoryTrend: async (
    n: number,
    base?: string,
  ): Promise<{
    months: string[]
    series: { categoryId: string; name: string; color: string; values: number[] }[]
  }> => {
    const months = lastNMonths(n, base)
    const categories = storage.getCategories()
    const all = storage.getTransactions().filter((t) => t.type === 'EXPENSE')

    // 各分類在此期間總支出，挑出前 4 大
    const totals = categories.map((c) => ({
      category: c,
      total: all
        .filter((t) => t.categoryId === c.id)
        .filter((t) => {
          const ym = t.date.slice(0, 7)
          return months.includes(ym)
        })
        .reduce((s, t) => s + t.amount, 0),
    }))
    totals.sort((a, b) => b.total - a.total)
    const top4 = totals.slice(0, 4).filter((x) => x.total > 0)
    const restIds = totals.slice(4).map((x) => x.category.id)

    const series = top4.map(({ category }) => ({
      categoryId: category.id,
      name: category.name,
      color: category.color,
      values: months.map((ym) => {
        const { from, to } = monthRange(ym)
        return all
          .filter(
            (t) => t.date >= from && t.date <= to && t.categoryId === category.id,
          )
          .reduce((s, t) => s + t.amount, 0)
      }),
    }))

    if (restIds.length > 0) {
      series.push({
        categoryId: 'others',
        name: '其他',
        color: '#888780',
        values: months.map((ym) => {
          const { from, to } = monthRange(ym)
          return all
            .filter(
              (t) =>
                t.date >= from && t.date <= to && restIds.includes(t.categoryId),
            )
            .reduce((s, t) => s + t.amount, 0)
        }),
      })
    }

    return { months, series }
  },
}
