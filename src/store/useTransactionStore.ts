import { create } from 'zustand'
import type { Transaction, TransactionFilters, TransactionFormData } from '@/types'
import { transactionService } from '@/services/transactionService'

interface TransactionState {
  transactions: Transaction[]
  filters: TransactionFilters
  isLoading: boolean
  error: string | null
  fetch: (filters?: TransactionFilters) => Promise<void>
  add: (data: TransactionFormData) => Promise<void>
  update: (id: string, data: TransactionFormData) => Promise<void>
  remove: (id: string) => Promise<void>
  setFilters: (filters: Partial<TransactionFilters>) => void
  resetFilters: () => void
}

const DEFAULT_FILTERS: TransactionFilters = { type: 'ALL', sort: 'date_desc' }

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  filters: DEFAULT_FILTERS,
  isLoading: false,
  error: null,
  fetch: async (filters) => {
    const merged = { ...get().filters, ...(filters ?? {}) }
    set({ isLoading: true, error: null, filters: merged })
    try {
      const data = await transactionService.list(merged)
      set({ transactions: data })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },
  add: async (data) => {
    await transactionService.create(data)
    await get().fetch()
  },
  update: async (id, data) => {
    await transactionService.update(id, data)
    await get().fetch()
  },
  remove: async (id) => {
    await transactionService.remove(id)
    await get().fetch()
  },
  setFilters: (filters) => {
    const merged = { ...get().filters, ...filters }
    set({ filters: merged })
    void get().fetch(merged)
  },
  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS })
    void get().fetch(DEFAULT_FILTERS)
  },
}))
