import { FC, useState } from 'react'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useUIStore } from '@/store/useUIStore'
import { COLOR_PALETTE } from '@/constants'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { Category } from '@/types'
import { categoryService } from '@/services/categoryService'

const CategoryManage: FC = () => {
  const { categories, add, remove, removeWithReassign } = useCategoryStore()
  const pushToast = useUIStore((s) => s.pushToast)

  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(COLOR_PALETTE[0].color)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [reassignTo, setReassignTo] = useState<string>('')

  const txCount = deleteTarget ? categoryService.countTransactions(deleteTarget.id) : 0
  const reassignCandidates = deleteTarget
    ? categories.filter((c) => c.id !== deleteTarget.id)
    : []

  const handleAdd = async () => {
    if (!name.trim()) return pushToast({ type: 'error', message: '請輸入名稱' })
    if (name.length > 10) return pushToast({ type: 'error', message: '名稱最多 10 字元' })
    if (categories.some((c) => c.name === name.trim())) {
      return pushToast({ type: 'error', message: '名稱已存在' })
    }
    setSubmitting(true)
    try {
      await add({ name: name.trim(), color })
      setName('')
      pushToast({ type: 'success', message: '已新增分類' })
    } catch (e) {
      pushToast({ type: 'error', message: (e as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (txCount > 0) {
        if (!reassignTo) return pushToast({ type: 'error', message: '請選擇歸入的分類' })
        await removeWithReassign(deleteTarget.id, reassignTo)
      } else {
        await remove(deleteTarget.id)
      }
      pushToast({ type: 'success', message: '已刪除分類' })
      setDeleteTarget(null)
      setReassignTo('')
    } catch (e) {
      pushToast({ type: 'error', message: (e as Error).message })
    }
  }

  return (
    <div className="space-y-4">
      {/* 新增表單 */}
      <div className="card p-4 sm:p-5">
        <h3 className="text-base font-bold mb-3">新增分類</h3>
        <div className="space-y-3">
          <div>
            <label className="label-text">名稱（最多 10 字元）</label>
            <input
              type="text"
              maxLength={10}
              className="input-field max-w-xs"
              placeholder="例：保險"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">代表色</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => setColor(p.color)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    color === p.color ? 'border-gray-900 scale-110' : 'border-white'
                  }`}
                  style={{ backgroundColor: p.color }}
                  aria-label={p.color}
                />
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? '新增中…' : '新增分類'}
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="card p-4 sm:p-5">
        <h3 className="text-base font-bold mb-3">分類列表（{categories.length}）</h3>
        {categories.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-600">尚無分類</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((c) => {
              const count = categoryService.countTransactions(c.id)
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-xs text-gray-600">{count} 筆交易</div>
                    </div>
                  </div>
                  <button
                    className="btn-ghost text-expense hover:text-expense"
                    onClick={() => setDeleteTarget(c)}
                    disabled={categories.length <= 1}
                  >
                    刪除
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`刪除分類「${deleteTarget?.name}」`}
        message={
          txCount > 0 ? (
            <div className="space-y-2">
              <div>
                此分類有 <span className="font-bold text-expense">{txCount}</span>{' '}
                筆交易，刪除後需將交易歸入：
              </div>
              <select
                className="input-field"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
              >
                <option value="">請選擇</option>
                {reassignCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            '確定要刪除此分類？此動作無法還原。'
          )
        }
        variant="danger"
        confirmText="刪除"
        onCancel={() => {
          setDeleteTarget(null)
          setReassignTo('')
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default CategoryManage
