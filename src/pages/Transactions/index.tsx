import { FC, useEffect, useMemo, useState } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useUIStore } from '@/store/useUIStore'
import CategoryBadge from '@/components/shared/CategoryBadge'
import MemberAvatar from '@/components/shared/MemberAvatar'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import type { TransactionType } from '@/types'

const Transactions: FC = () => {
  const { transactions, filters, setFilters, resetFilters, remove } = useTransactionStore()
  const categories = useCategoryStore((s) => s.categories)
  const members = useMemberStore((s) => s.members)
  const openModal = useUIStore((s) => s.openTransactionModal)
  const pushToast = useUIStore((s) => s.pushToast)

  const [keyword, setKeyword] = useState(filters.keyword ?? '')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // debounce 關鍵字搜尋
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ keyword: keyword || undefined })
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const findMember = (id: string) => members.find((m) => m.id === id)
  const findCategory = (id: string) => categories.find((c) => c.id === id)

  // 同日合併顯示
  const grouped = useMemo(() => {
    const groups: Record<string, typeof transactions> = {}
    transactions.forEach((tx) => {
      groups[tx.date] = groups[tx.date] ?? []
      groups[tx.date].push(tx)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [transactions])

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await remove(deleteId)
      pushToast({ type: 'success', message: '已刪除交易' })
    } catch (e) {
      pushToast({ type: 'error', message: (e as Error).message })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* 篩選列 */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="label-text">關鍵字</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input-field"
              placeholder="搜尋項目名稱或備註"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-text">類型</label>
            <select
              className="input-field"
              value={filters.type ?? 'ALL'}
              onChange={(e) =>
                setFilters({ type: e.target.value as TransactionType | 'ALL' })
              }
            >
              <option value="ALL">全部</option>
              <option value="EXPENSE">支出</option>
              <option value="INCOME">收入</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-text">分類</label>
            <select
              className="input-field"
              value={filters.categoryIds?.[0] ?? ''}
              onChange={(e) =>
                setFilters({
                  categoryIds: e.target.value ? [e.target.value] : undefined,
                })
              }
            >
              <option value="">全部</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-text">成員</label>
            <select
              className="input-field"
              value={filters.memberIds?.[0] ?? ''}
              onChange={(e) =>
                setFilters({
                  memberIds: e.target.value ? [e.target.value] : undefined,
                })
              }
            >
              <option value="">全部</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-text">排序</label>
            <select
              className="input-field"
              value={filters.sort ?? 'date_desc'}
              onChange={(e) =>
                setFilters({ sort: e.target.value as 'date_desc' | 'date_asc' | 'amount_desc' })
              }
            >
              <option value="date_desc">日期（新→舊）</option>
              <option value="date_asc">日期（舊→新）</option>
              <option value="amount_desc">金額（大→小）</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="label-text">起始日期</label>
            <input
              type="date"
              className="input-field"
              value={filters.dateFrom ?? ''}
              onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
            />
          </div>
          <div className="md:col-span-3">
            <label className="label-text">結束日期</label>
            <input
              type="date"
              className="input-field"
              value={filters.dateTo ?? ''}
              onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
            />
          </div>
          <div className="md:col-span-6 flex items-end justify-end gap-2">
            <button
              className="btn-secondary"
              onClick={() => {
                setKeyword('')
                resetFilters()
              }}
            >
              清除篩選
            </button>
            <button className="btn-primary" onClick={() => openModal()}>
              ＋ 新增交易
            </button>
          </div>
        </div>
      </div>

      {/* 摘要 */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="card p-3">
          <div className="text-xs text-gray-600">符合筆數</div>
          <div className="text-lg font-bold text-gray-900">{transactions.length} 筆</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-gray-600">收入合計</div>
          <div className="text-lg font-bold text-income">+{formatCurrency(totalIncome)}</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-gray-600">支出合計</div>
          <div className="text-lg font-bold text-expense">-{formatCurrency(totalExpense)}</div>
        </div>
      </div>

      {/* 列表 */}
      <div className="card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-600">
            找不到符合條件的交易
          </div>
        ) : (
          <ul>
            {grouped.map(([date, items]) => (
              <li key={date}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600 sticky top-0">
                  {formatDate(date, 'yyyy-MM-dd (eee)')}
                </div>
                <ul className="divide-y divide-gray-100">
                  {items.map((tx) => {
                    const cat = findCategory(tx.categoryId)
                    const mem = findMember(tx.memberId)
                    if (!cat || !mem) return null
                    return (
                      <li
                        key={tx.id}
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                      >
                        <MemberAvatar member={mem} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {tx.name}
                            </span>
                            <CategoryBadge category={cat} />
                          </div>
                          {tx.note && (
                            <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                              {tx.note}
                            </div>
                          )}
                        </div>
                        <div
                          className={`text-sm font-bold whitespace-nowrap ${
                            tx.type === 'INCOME' ? 'text-income' : 'text-expense'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </div>
                        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            className="btn-ghost px-2"
                            onClick={() => openModal(tx)}
                            aria-label="編輯"
                          >
                            ✎
                          </button>
                          <button
                            className="btn-ghost px-2 text-expense hover:text-expense"
                            onClick={() => setDeleteId(tx.id)}
                            aria-label="刪除"
                          >
                            ✕
                          </button>
                        </div>
                        {/* 行動版：點整列編輯 */}
                        <button
                          className="sm:hidden text-xs text-gray-600 hover:text-gray-900"
                          onClick={() => openModal(tx)}
                        >
                          編輯
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="刪除交易"
        message="確定要刪除這筆交易嗎？此動作無法還原。"
        confirmText="刪除"
        variant="danger"
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default Transactions
