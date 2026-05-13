import { create } from 'zustand'
import type { Budget, BudgetStat } from '@/types'
import { budgetService } from '@/services/budgetService'
import { currentYearMonth } from '@/utils/formatDate'

interface BudgetState {
  yearMonth: string
  budgets: Budget[]
  overview: BudgetStat[]
  isLoading: boolean
  error: string | null
  setYearMonth: (yearMonth: string) => void
  fetch: () => Promise<void>
  upsertMany: (data: { categoryId: string; amount: number }[]) => Promise<void>
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  yearMonth: currentYearMonth(),
  budgets: [],
  overview: [],
  isLoading: false,
  error: null,
  setYearMonth: (yearMonth) => {
    set({ yearMonth })
    void get().fetch()
  },
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const ym = get().yearMonth
      const [budgets, overview] = await Promise.all([
        budgetService.list(ym),
        budgetService.overview(ym),
      ])
      set({ budgets, overview })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },
  upsertMany: async (data) => {
    await budgetService.upsertMany(get().yearMonth, data)
    await get().fetch()
  },
}))
