import { FC, useEffect, useState } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useBudgetStore } from '@/store/useBudgetStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useUIStore } from '@/store/useUIStore'
import { transactionService } from '@/services/transactionService'
import { analyticsService } from '@/services/analyticsService'
import { currentYearMonth, formatDate, formatYearMonth } from '@/utils/formatDate'
import { formatCurrency, formatPercent } from '@/utils/formatCurrency'
import SummaryCard from '@/components/shared/SummaryCard'
import CategoryBadge from '@/components/shared/CategoryBadge'
import MemberAvatar from '@/components/shared/MemberAvatar'
import BudgetProgressBar from '@/components/shared/BudgetProgressBar'
import TrendLineChart from '@/components/charts/TrendLineChart'
import CategoryDonut from '@/components/charts/CategoryDonut'
import type { MonthlySummary, CategoryStat } from '@/types'

const Dashboard: FC = () => {
  const ym = currentYearMonth()
  const transactions = useTransactionStore((s) => s.transactions)
  const overview = useBudgetStore((s) => s.overview)
  const categories = useCategoryStore((s) => s.categories)
  const members = useMemberStore((s) => s.members)
  const openModal = useUIStore((s) => s.openTransactionModal)

  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [trend, setTrend] = useState<
    { yearMonth: string; income: number; expense: number }[]
  >([])
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])

  useEffect(() => {
    let mounted = true
    Promise.all([
      transactionService.monthlySummary(ym),
      analyticsService.monthlyTrend(6),
      analyticsService.categoryStats(ym),
    ]).then(([s, t, c]) => {
      if (!mounted) return
      setSummary(s)
      setTrend(t)
      setCategoryStats(c)
    })
    return () => {
      mounted = false
    }
  }, [ym, transactions, overview])

  const recent = transactions.slice(0, 5)
  const dangerBudgets = overview.filter((o) => o.status === 'danger').slice(0, 3)

  const findMember = (id: string) => members.find((m) => m.id === id)
  const findCategory = (id: string) => categories.find((c) => c.id === id)

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        統計月份：<span className="font-medium text-gray-900">{formatYearMonth(ym)}</span>
      </div>

      {/* 警示卡 */}
      {dangerBudgets.length > 0 && (
        <div className="card p-4 border-l-4 border-l-expense bg-red-50/50 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <div className="font-bold text-expense mb-1">預算警示</div>
            <div className="text-sm text-gray-700">
              以下分類已達 90% 預算：
              {dangerBudgets.map((b, i) => (
                <span key={b.budget.id}>
                  {i > 0 && '、'}
                  <span className="font-medium" style={{ color: b.category.color }}>
                    {b.category.name}（{formatPercent(b.usageRate, 0)}）
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <SummaryCard
          label="本月支出"
          value={summary ? formatCurrency(summary.totalExpense) : '—'}
          tone={
            summary && summary.budgetUsageRate >= 0.9
              ? 'danger'
              : summary && summary.budgetUsageRate >= 0.7
                ? 'warn'
                : 'expense'
          }
        />
        <SummaryCard
          label="本月收入"
          value={summary ? formatCurrency(summary.totalIncome) : '—'}
          tone="income"
        />
        <SummaryCard
          label="本月結餘"
          value={summary ? formatCurrency(summary.balance) : '—'}
          tone={summary && summary.balance < 0 ? 'danger' : 'income'}
        />
        <SummaryCard
          label="預算使用率"
          value={summary ? formatPercent(summary.budgetUsageRate, 0) : '—'}
          sub={
            summary
              ? `總預算 ${formatCurrency(summary.totalBudget)}`
              : undefined
          }
          tone={
            summary && summary.budgetUsageRate >= 0.9
              ? 'danger'
              : summary && summary.budgetUsageRate >= 0.7
                ? 'warn'
                : 'default'
          }
        />
      </div>

      {/* 圖表區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">近 6 個月收支趨勢</h3>
          </div>
          <TrendLineChart data={trend} />
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">本月支出分類</h3>
          </div>
          <CategoryDonut
            data={categoryStats.map((c) => ({
              name: c.category.name,
              value: c.amount,
              color: c.category.color,
            }))}
          />
        </div>
      </div>

      {/* 列表區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 最近交易 */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">最近交易</h3>
            <button
              className="text-sm text-brand font-medium hover:underline"
              onClick={() => openModal()}
            >
              ＋ 新增
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-600">
              尚無任何交易，點擊「新增」開始記帳吧！
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((tx) => {
                const cat = findCategory(tx.categoryId)
                const mem = findMember(tx.memberId)
                if (!cat || !mem) return null
                return (
                  <li
                    key={tx.id}
                    className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-50 px-1 -mx-1 rounded"
                    onClick={() => openModal(tx)}
                  >
                    <MemberAvatar member={mem} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {tx.name}
                        </span>
                        <CategoryBadge category={cat} />
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {formatDate(tx.date)} · {mem.name}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        tx.type === 'INCOME' ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* 預算進度 */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">預算進度</h3>
          </div>
          {overview.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-600">
              尚未設定本月預算，請至「預算管理」設定
            </div>
          ) : (
            <ul className="space-y-3">
              {overview.slice(0, 6).map((b) => (
                <li key={b.budget.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={b.category} />
                      <span className="text-xs text-gray-600">
                        {formatCurrency(b.spent)} / {formatCurrency(b.budget.amount)}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: b.status === 'safe' ? '#1D9E75' : b.status === 'warn' ? '#EF9F27' : '#E24B4A' }}
                    >
                      {formatPercent(b.usageRate, 0)}
                    </span>
                  </div>
                  <BudgetProgressBar usageRate={b.usageRate} status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
