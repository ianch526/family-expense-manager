import { FC } from 'react'
import { budgetColor } from '@/utils/calcStats'
import { clamp } from '@/utils/calcStats'

interface Props {
  usageRate: number // 0..1+
  status?: 'safe' | 'warn' | 'danger'
  height?: number
}

const BudgetProgressBar: FC<Props> = ({ usageRate, status, height = 8 }) => {
  const widthPct = clamp(usageRate, 0, 1) * 100
  const color = budgetColor(
    status ?? (usageRate >= 0.9 ? 'danger' : usageRate >= 0.7 ? 'warn' : 'safe'),
  )
  return (
    <div
      className="w-full bg-gray-100 rounded-full overflow-hidden"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(widthPct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full transition-all duration-500 ease-out rounded-full"
        style={{ width: `${widthPct}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default BudgetProgressBar
