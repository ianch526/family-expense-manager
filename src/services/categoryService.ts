import { storage } from './storage'
import type { Category, CategoryFormData } from '@/types'
import { uniqueId } from '@/utils/calcStats'
import { COLOR_PALETTE } from '@/constants'

function findLightColor(color: string): string {
  const hit = COLOR_PALETTE.find((p) => p.color.toLowerCase() === color.toLowerCase())
  return hit ? hit.light : '#F1F3F5'
}

export const categoryService = {
  list: async (): Promise<Category[]> => {
    return storage.getCategories().sort((a, b) => a.sortOrder - b.sortOrder)
  },
  create: async (data: CategoryFormData): Promise<Category> => {
    const list = storage.getCategories()
    if (list.some((c) => c.name === data.name)) {
      throw new Error('分類名稱已存在')
    }
    const next: Category = {
      id: uniqueId('cat'),
      name: data.name,
      color: data.color,
      lightColor: findLightColor(data.color),
      isActive: true,
      sortOrder: list.length,
    }
    storage.setCategories([...list, next])
    return next
  },
  update: async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    const list = storage.getCategories()
    const idx = list.findIndex((c) => c.id === id)
    if (idx < 0) throw new Error('分類不存在')
    const merged: Category = {
      ...list[idx],
      ...data,
      lightColor: data.color ? findLightColor(data.color) : list[idx].lightColor,
    }
    list[idx] = merged
    storage.setCategories(list)
    return merged
  },
  remove: async (id: string): Promise<void> => {
    const list = storage.getCategories()
    if (list.length <= 1) throw new Error('至少需保留 1 個分類')
    const tx = storage.getTransactions()
    if (tx.some((t) => t.categoryId === id)) {
      throw new Error('此分類仍有關聯交易')
    }
    storage.setCategories(list.filter((c) => c.id !== id))
    storage.setBudgets(storage.getBudgets().filter((b) => b.categoryId !== id))
  },
  removeWithReassign: async (id: string, fallbackId: string): Promise<void> => {
    const list = storage.getCategories()
    if (list.length <= 1) throw new Error('至少需保留 1 個分類')
    const tx = storage.getTransactions().map((t) =>
      t.categoryId === id ? { ...t, categoryId: fallbackId, updatedAt: new Date().toISOString() } : t,
    )
    storage.setTransactions(tx)
    storage.setCategories(list.filter((c) => c.id !== id))
    storage.setBudgets(storage.getBudgets().filter((b) => b.categoryId !== id))
  },
  countTransactions: (id: string): number => {
    return storage.getTransactions().filter((t) => t.categoryId === id).length
  },
}
