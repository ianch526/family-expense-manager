import { FC } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { shortMonth } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'

interface Props {
  months: string[]
  series: { categoryId: string; name: string; color: string; values: number[] }[]
}

const CategoryTrendLines: FC<Props> = ({ months, series }) => {
  const data = months.map((ym, i) => {
    const row: Record<string, string | number> = { name: shortMonth(ym) }
    series.forEach((s) => {
      row[s.name] = s.values[i]
    })
    return row
  })

  if (series.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-gray-600">
        近期無支出資料
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#868E96' }} />
        <YAxis
          tick={{ fontSize: 11, fill: '#868E96' }}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line
            key={s.categoryId}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default CategoryTrendLines
