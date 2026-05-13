import { create } from 'zustand'
import type { Category, CategoryFormData } from '@/types'
import { categoryService } from '@/services/categoryService'

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: CategoryFormData) => Promise<void>
  update: (id: string, data: Partial<CategoryFormData>) => Promise<void>
  remove: (id: string) => Promise<void>
  removeWithReassign: (id: string, fallbackId: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await categoryService.list()
      set({ categories: data })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },
  add: async (data) => {
    await categoryService.create(data)
    await get().fetch()
  },
  update: async (id, data) => {
    await categoryService.update(id, data)
    await get().fetch()
  },
  remove: async (id) => {
    await categoryService.remove(id)
    await get().fetch()
  },
  removeWithReassign: async (id, fallbackId) => {
    await categoryService.removeWithReassign(id, fallbackId)
    await get().fetch()
  },
}))
