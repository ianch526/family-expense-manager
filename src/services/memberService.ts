import { storage } from './storage'
import type { Member, MemberFormData } from '@/types'
import { uniqueId } from '@/utils/calcStats'
import { COLOR_PALETTE } from '@/constants'

function findLightColor(color: string): string {
  const hit = COLOR_PALETTE.find((p) => p.color.toLowerCase() === color.toLowerCase())
  return hit ? hit.light : '#F1F3F5'
}

export const memberService = {
  list: async (): Promise<Member[]> => storage.getMembers(),
  create: async (data: MemberFormData): Promise<Member> => {
    const list = storage.getMembers()
    if (list.some((m) => m.name === data.name)) {
      throw new Error('成員名稱已存在')
    }
    const next: Member = {
      id: uniqueId('mem'),
      name: data.name,
      color: data.color,
      lightColor: findLightColor(data.color),
      isActive: true,
    }
    storage.setMembers([...list, next])
    return next
  },
  update: async (id: string, data: Partial<MemberFormData>): Promise<Member> => {
    const list = storage.getMembers()
    const idx = list.findIndex((m) => m.id === id)
    if (idx < 0) throw new Error('成員不存在')
    const merged: Member = {
      ...list[idx],
      ...data,
      lightColor: data.color ? findLightColor(data.color) : list[idx].lightColor,
    }
    list[idx] = merged
    storage.setMembers(list)
    return merged
  },
  remove: async (id: string): Promise<void> => {
    const list = storage.getMembers()
    if (list.length <= 1) throw new Error('至少需保留 1 個成員')
    const tx = storage.getTransactions()
    if (tx.some((t) => t.memberId === id)) {
      throw new Error('此成員仍有關聯交易')
    }
    storage.setMembers(list.filter((m) => m.id !== id))
  },
  removeWithReassign: async (id: string, fallbackId: string): Promise<void> => {
    const list = storage.getMembers()
    if (list.length <= 1) throw new Error('至少需保留 1 個成員')
    const tx = storage.getTransactions().map((t) =>
      t.memberId === id ? { ...t, memberId: fallbackId, updatedAt: new Date().toISOString() } : t,
    )
    storage.setTransactions(tx)
    storage.setMembers(list.filter((m) => m.id !== id))
  },
  countTransactions: (id: string): number => {
    return storage.getTransactions().filter((t) => t.memberId === id).length
  },
}
