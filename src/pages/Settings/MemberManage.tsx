import { FC, useState } from 'react'
import { useMemberStore } from '@/store/useMemberStore'
import { useUIStore } from '@/store/useUIStore'
import { COLOR_PALETTE } from '@/constants'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import MemberAvatar from '@/components/shared/MemberAvatar'
import { memberService } from '@/services/memberService'
import type { Member } from '@/types'

const MemberManage: FC = () => {
  const { members, add, remove, removeWithReassign } = useMemberStore()
  const pushToast = useUIStore((s) => s.pushToast)

  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[0].color)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [reassignTo, setReassignTo] = useState<string>('')

  const txCount = deleteTarget ? memberService.countTransactions(deleteTarget.id) : 0
  const reassignCandidates = deleteTarget
    ? members.filter((m) => m.id !== deleteTarget.id)
    : []

  const handleAdd = async () => {
    if (!name.trim()) return pushToast({ type: 'error', message: '請輸入名稱' })
    if (name.length > 6) return pushToast({ type: 'error', message: '名稱最多 6 字元' })
    if (members.some((m) => m.name === name.trim())) {
      return pushToast({ type: 'error', message: '名稱已存在' })
    }
    setSubmitting(true)
    try {
      await add({ name: name.trim(), color })
      setName('')
      pushToast({ type: 'success', message: '已新增成員' })
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
        if (!reassignTo) return pushToast({ type: 'error', message: '請選擇歸入的成員' })
        await removeWithReassign(deleteTarget.id, reassignTo)
      } else {
        await remove(deleteTarget.id)
      }
      pushToast({ type: 'success', message: '已刪除成員' })
      setDeleteTarget(null)
      setReassignTo('')
    } catch (e) {
      pushToast({ type: 'error', message: (e as Error).message })
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h3 className="text-base font-bold mb-3">新增成員</h3>
        <div className="space-y-3">
          <div>
            <label className="label-text">名稱（最多 6 字元）</label>
            <input
              type="text"
              maxLength={6}
              className="input-field max-w-xs"
              placeholder="例：弟弟"
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
            {submitting ? '新增中…' : '新增成員'}
          </button>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <h3 className="text-base font-bold mb-3">成員列表（{members.length}）</h3>
        {members.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-600">尚無成員</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {members.map((m) => {
              const count = memberService.countTransactions(m.id)
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MemberAvatar member={m} size="md" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m.name}</div>
                      <div className="text-xs text-gray-600">{count} 筆交易</div>
                    </div>
                  </div>
                  <button
                    className="btn-ghost text-expense hover:text-expense"
                    onClick={() => setDeleteTarget(m)}
                    disabled={members.length <= 1}
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
        title={`刪除成員「${deleteTarget?.name}」`}
        message={
          txCount > 0 ? (
            <div className="space-y-2">
              <div>
                此成員有 <span className="font-bold text-expense">{txCount}</span>{' '}
                筆交易，刪除後需將交易歸入：
              </div>
              <select
                className="input-field"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
              >
                <option value="">請選擇</option>
                {reassignCandidates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            '確定要刪除此成員？此動作無法還原。'
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

export default MemberManage
