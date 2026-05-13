import { FC, useEffect, useMemo, useState } from 'react'
import { useBudgetStore } from '@/store/useBudgetStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useUIStore } from '@/store/useUIStore'
import BudgetProgressBar from '@/components/shared/BudgetProgressBar'
import CategoryBadge from '@/components/shared/CategoryBadge'
import { formatCurrency, formatPercent } from '@/utils/formatCurrency'
import { lastNMonths, formatYearMonth, currentYearMonth } from '@/utils/formatDate'

const Budget: FC = () => {
  const { yearMonth, budgets, overview, setYearMonth, upsertMany, fetch } = useBudgetStore()
  const categories = useCategoryStore((s) => s.categories)
  const pushToast = useUIStore((s) => s.pushToast)

  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void fetch()
  }, [fetch])

  // 將現有預算 + 所有分類 merge 成可編輯狀態
  useEffect(() => {
    const next: Record<string, string> = {}
    categories.forEach((c) => {
      const found = budgets.find((b) => b.categoryId === c.id)
      next[c.id] = found ? String(found.amount) : ''
    })
    setEditing(next)
  }, [budgets, categories])

  const monthOptions = useMemo(() => {
    const past = lastNMonths(6)
    const cur = currentYearMonth()
    if (!past.includes(cur)) past.push(cur)
    return past.sort().reverse()
  }, [])

  const totalBudget = useMemo(
    () =>
      Object.values(editing).reduce((s, v) => s + (Number(v) || 0), 0),
    [editing],
  )
  const totalSpent = overview.reduce((s, o) => s + o.spent, 0)
  const totalRate = totalBudget > 0 ? totalSpent / totalBudget : 0

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = categories
        .map((c) => ({ categoryId: c.id, amount: Number(editing[c.id]) || 0 }))
        .filter((d) => d.amount > 0)
      await upsertMany(data)
      pushToast({ type: 'success', message: '預算已儲存' })
    } catch (e) {
      pushToast({ type: 'error', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 月份選擇 + 摘要 */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <label className="label-text">統計月份</label>
            <select
              className="input-field max-w-[180px]"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatYearMonth(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="text-xs text-gray-600">總預算</div>
              <div className="text-lg font-bold">{formatCurrency(totalBudget)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">已支出</div>
              <div className="text-lg font-bold text-expense">
                {formatCurrency(totalSpent)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">使用率</div>
              <div
                className="text-lg font-bold"
                style={{
                  color:
                    totalRate >= 0.9 ? '#E24B4A' : totalRate >= 0.7 ? '#EF9F27' : '#1D9E75',
                }}
              >
                {formatPercent(totalRate, 0)}
              </div>
            </div>
          </div>
        </div>
        <BudgetProgressBar usageRate={totalRate} />
      </div>

      {/* 各分類預算編輯 */}
      <div className="card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">各分類預算</h3>
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? '儲存中…' : '儲存預算'}
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-600">
            請先在「分類管理」新增分類
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((c) => {
              const stat = overview.find((o) => o.budget.categoryId === c.id)
              const value = editing[c.id] ?? ''
              const num = Number(value) || 0
              const usage = num > 0 && stat ? stat.spent / num : 0
              return (
                <li key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="sm:w-32 flex items-center gap-2">
                    <CategoryBadge category={c} size="md" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">
                        已支出 {formatCurrency(stat?.spent ?? 0)}
                      </span>
                      {num > 0 && (
                        <span
                          className="text-xs font-bold"
                          style={{
                            color:
                              usage >= 0.9
                                ? '#E24B4A'
                                : usage >= 0.7
                                  ? '#EF9F27'
                                  : '#1D9E75',
                          }}
                        >
                          {formatPercent(usage, 0)}
                        </span>
                      )}
                    </div>
                    <BudgetProgressBar usageRate={usage} />
                  </div>
                  <div className="sm:w-44">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        className="input-field pr-8"
                        placeholder="0"
                        value={value}
                        onChange={(e) =>
                          setEditing((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                        元
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Budget
