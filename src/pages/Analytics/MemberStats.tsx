import { FC, useEffect, useMemo, useState } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { analyticsService } from '@/services/analyticsService'
import { currentYearMonth, lastNMonths, formatYearMonth } from '@/utils/formatDate'
import { formatCurrency, formatPercent } from '@/utils/formatCurrency'
import CategoryDonut from '@/components/charts/CategoryDonut'
import MemberStackBar from '@/components/charts/MemberStackBar'
import MemberAvatar from '@/components/shared/MemberAvatar'
import CategoryBadge from '@/components/shared/CategoryBadge'
import BudgetProgressBar from '@/components/shared/BudgetProgressBar'
import type { MemberStat } from '@/types'

const MemberStats: FC = () => {
  const transactions = useTransactionStore((s) => s.transactions)
  const categories = useCategoryStore((s) => s.categories)
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [stats, setStats] = useState<MemberStat[]>([])
  const [expandId, setExpandId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    analyticsService.memberStats(yearMonth).then((s) => mounted && setStats(s))
    return () => {
      mounted = false
    }
  }, [yearMonth, transactions])

  const monthOptions = useMemo(() => {
    const past = lastNMonths(6)
    const cur = currentYearMonth()
    if (!past.includes(cur)) past.push(cur)
    return past.sort().reverse()
  }, [])

  const total = stats.reduce((s, c) => s + c.amount, 0)
  const max = stats[0]?.amount ?? 0

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
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
        <div className="text-sm text-gray-600">
          本月總支出：
          <span className="text-base font-bold text-expense ml-1">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4 sm:p-5">
          <h3 className="text-base font-bold mb-3">成員消費佔比</h3>
          <CategoryDonut
            data={stats
              .filter((s) => s.amount > 0)
              .map((s) => ({
                name: s.member.name,
                value: s.amount,
                color: s.member.color,
              }))}
          />
        </div>
        <div className="card p-4 sm:p-5">
          <h3 className="text-base font-bold mb-3">成員 × 分類消費</h3>
          <MemberStackBar data={stats} categories={categories} />
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <h3 className="text-base font-bold mb-3">成員消費排行</h3>
        {stats.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-600">本月尚無支出</div>
        ) : (
          <ul className="space-y-2">
            {stats.map((s) => {
              const expanded = expandId === s.member.id
              return (
                <li
                  key={s.member.id}
                  className="rounded-lg border border-gray-100 hover:border-gray-200"
                >
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left"
                    onClick={() => setExpandId(expanded ? null : s.member.id)}
                  >
                    <MemberAvatar member={s.member} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{s.member.name}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">
                            {formatPercent(s.percentage, 0)}
                          </span>
                          <span className="font-bold">{formatCurrency(s.amount)}</span>
                        </div>
                      </div>
                      <BudgetProgressBar
                        usageRate={max > 0 ? s.amount / max : 0}
                        status="safe"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">{expanded ? '▴' : '▾'}</span>
                  </button>
                  {expanded && s.byCategory.length > 0 && (
                    <ul className="px-4 pb-3 pt-1 space-y-1 border-t border-gray-100">
                      {s.byCategory
                        .sort((a, b) => b.amount - a.amount)
                        .map((bc) => (
                          <li
                            key={bc.category.id}
                            className="flex items-center justify-between py-1 text-sm"
                          >
                            <CategoryBadge category={bc.category} />
                            <span className="font-medium">{formatCurrency(bc.amount)}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MemberStats
