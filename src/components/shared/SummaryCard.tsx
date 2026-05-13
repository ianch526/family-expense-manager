import { FC, ReactNode } from 'react'

type Tone = 'default' | 'income' | 'expense' | 'warn' | 'danger'

interface Props {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: Tone
  icon?: ReactNode
}

const toneClass: Record<Tone, string> = {
  default: 'text-gray-900',
  income: 'text-income',
  expense: 'text-expense',
  warn: 'text-warning',
  danger: 'text-expense',
}

const SummaryCard: FC<Props> = ({ label, value, sub, tone = 'default', icon }) => {
  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl sm:text-[28px] font-bold leading-tight ${toneClass[tone as Tone]}`}>
        {value}
      </div>
      {sub != null && <div className="text-xs text-gray-600">{sub}</div>}
    </div>
  )
}

export default SummaryCard
