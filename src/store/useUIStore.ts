import { create } from 'zustand'
import type { Transaction } from '@/types'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface UIState {
  transactionModalOpen: boolean
  editingTransaction: Transaction | null
  prefilledType: 'INCOME' | 'EXPENSE'
  sidebarCollapsed: boolean
  toasts: ToastMessage[]
  openTransactionModal: (target?: Transaction | null, type?: 'INCOME' | 'EXPENSE') => void
  closeTransactionModal: () => void
  toggleSidebar: () => void
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  transactionModalOpen: false,
  editingTransaction: null,
  prefilledType: 'EXPENSE',
  sidebarCollapsed: false,
  toasts: [],
  openTransactionModal: (target, type) =>
    set({
      transactionModalOpen: true,
      editingTransaction: target ?? null,
      prefilledType: type ?? target?.type ?? 'EXPENSE',
    }),
  closeTransactionModal: () =>
    set({ transactionModalOpen: false, editingTransaction: null }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  pushToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    set({ toasts: [...get().toasts, { ...toast, id }] })
    setTimeout(() => get().removeToast(id), 3500)
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))
