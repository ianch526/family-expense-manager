import { FC, useEffect, useMemo, useState } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { analyticsService } from '@/services/analyticsService'
import { currentYearMonth, lastNMonths, formatYearMonth } from '@/utils/formatDate'
import { formatCurrency, formatPercent } from '@/utils/formatCurrency'
import CategoryDonut from '@/components/charts/CategoryDonut'
import CategoryTrendLines from '@/components/charts/CategoryTrendLines'
import BudgetProgressBar from '@/components/shared/BudgetProgressBar'
import CategoryBadge from '@/components/shared/CategoryBadge'
import type { CategoryStat } from '@/types'

const CategoryStats: FC = () => {
  const transactions = useTransactionStore((s) => s.transactions)
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [stats, setStats] = useState<CategoryStat[]>([])
  const [trend, setTrend] = useState<{
    months: string[]
    series: { categoryId: string; name: string; color: string; values: number[] }[]
  }>({ months: [], series: [] })

  useEffect(() => {
    let mounted = true
    Promise.all([
      analyticsService.categoryStats(yearMonth),
      analyticsService.categoryTrend(6, yearMonth),
    ]).then(([s, t]) => {
      if (!mounted) return
      setStats(s)
      setTrend(t)
    })
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
          <h3 className="text-base font-bold mb-3">分類佔比</h3>
          <CategoryDonut
            data={stats.map((c) => ({
              name: c.category.name,
              value: c.amount,
              color: c.category.color,
            }))}
          />
        </div>
        <div className="card p-4 sm:p-5">
          <h3 className="text-base font-bold mb-3">近 6 個月分類趨勢</h3>
          <CategoryTrendLines months={trend.months} series={trend.series} />
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <h3 className="text-base font-bold mb-3">分類支出排行</h3>
        {stats.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-600">本月尚無支出</div>
        ) : (
          <ul className="space-y-3">
            {stats.map((c) => (
              <li key={c.category.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={c.category} />
                    <span className="text-xs text-gray-600">
                      {c.transactionCount} 筆
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">{formatPercent(c.percentage, 0)}</span>
                    <span className="font-bold">{formatCurrency(c.amount)}</span>
                  </div>
                </div>
                <BudgetProgressBar
                  usageRate={max > 0 ? c.amount / max : 0}
                  status="safe"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default CategoryStats
