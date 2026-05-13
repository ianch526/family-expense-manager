import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, TransactionFormData } from '@/types'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useUIStore } from '@/store/useUIStore'
import { todayISO } from '@/utils/formatDate'

const TransactionModal: FC = () => {
  const open = useUIStore((s) => s.transactionModalOpen)
  const editing = useUIStore((s) => s.editingTransaction)
  const prefilledType = useUIStore((s) => s.prefilledType)
  const close = useUIStore((s) => s.closeTransactionModal)
  const pushToast = useUIStore((s) => s.pushToast)

  const categories = useCategoryStore((s) => s.categories)
  const members = useMemberStore((s) => s.members)
  const addTx = useTransactionStore((s) => s.add)
  const updateTx = useTransactionStore((s) => s.update)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      amount: 0,
      name: '',
      categoryId: '',
      memberId: '',
      date: todayISO(),
      note: '',
    },
  })

  const currentType = watch('type')

  // 開啟時填入預設資料
  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        type: editing.type,
        amount: editing.amount,
        name: editing.name,
        categoryId: editing.categoryId,
        memberId: editing.memberId,
        date: editing.date,
        note: editing.note ?? '',
      })
    } else {
      reset({
        type: prefilledType,
        amount: 0,
        name: '',
        categoryId: categories[0]?.id ?? '',
        memberId: members[0]?.id ?? '',
        date: todayISO(),
        note: '',
      })
    }
  }, [open, editing, prefilledType, categories, members, reset])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, close])

  if (!open) return null

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (editing) {
        await updateTx(editing.id, data)
        pushToast({ type: 'success', message: '已更新交易' })
      } else {
        await addTx(data)
        pushToast({ type: 'success', message: '已新增交易' })
      }
      close()
    } catch (e) {
      pushToast({ type: 'error', message: (e as Error).message || '儲存失敗' })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-lg p-5 sm:p-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {editing ? '編輯交易' : '新增交易'}
          </h2>
          <button onClick={close} className="btn-ghost px-2" aria-label="關閉">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* 類型 */}
          <div>
            <label className="label-text">類型</label>
            <div className="grid grid-cols-2 gap-2">
              {(['EXPENSE', 'INCOME'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setValue('type', t, { shouldValidate: true })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                    currentType === t
                      ? t === 'EXPENSE'
                        ? 'bg-expense text-white border-expense'
                        : 'bg-income text-white border-income'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t === 'EXPENSE' ? '支出' : '收入'}
                </button>
              ))}
            </div>
          </div>

          {/* 金額 */}
          <div>
            <label className="label-text">金額</label>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              className="input-field"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-expense mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* 項目名稱 */}
          <div>
            <label className="label-text">項目名稱</label>
            <input
              type="text"
              className="input-field"
              placeholder="例：午餐便當"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-expense mt-1">{errors.name.message}</p>}
          </div>

          {/* 分類 + 成員 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">分類</label>
              <select className="input-field" {...register('categoryId')}>
                <option value="">請選擇</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-expense mt-1">{errors.categoryId.message}</p>
              )}
            </div>
            <div>
              <label className="label-text">成員</label>
              <select className="input-field" {...register('memberId')}>
                <option value="">請選擇</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <p className="text-xs text-expense mt-1">{errors.memberId.message}</p>
              )}
            </div>
          </div>

          {/* 日期 */}
          <div>
            <label className="label-text">日期</label>
            <input
              type="date"
              className="input-field"
              max={todayISO()}
              {...register('date')}
            />
            {errors.date && <p className="text-xs text-expense mt-1">{errors.date.message}</p>}
          </div>

          {/* 備註 */}
          <div>
            <label className="label-text">備註（選填）</label>
            <textarea
              rows={2}
              className="input-field resize-none"
              placeholder="補充說明…"
              {...register('note')}
            />
            {errors.note && <p className="text-xs text-expense mt-1">{errors.note.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={close}>
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionModal
