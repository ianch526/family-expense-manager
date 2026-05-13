import { create } from 'zustand'
import type { Member, MemberFormData } from '@/types'
import { memberService } from '@/services/memberService'

interface MemberState {
  members: Member[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: MemberFormData) => Promise<void>
  update: (id: string, data: Partial<MemberFormData>) => Promise<void>
  remove: (id: string) => Promise<void>
  removeWithReassign: (id: string, fallbackId: string) => Promise<void>
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await memberService.list()
      set({ members: data })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },
  add: async (data) => {
    await memberService.create(data)
    await get().fetch()
  },
  update: async (id, data) => {
    await memberService.update(id, data)
    await get().fetch()
  },
  remove: async (id) => {
    await memberService.remove(id)
    await get().fetch()
  },
  removeWithReassign: async (id, fallbackId) => {
    await memberService.removeWithReassign(id, fallbackId)
    await get().fetch()
  },
}))
