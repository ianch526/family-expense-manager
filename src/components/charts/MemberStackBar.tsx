import { FC } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'
import type { MemberStat, Category } from '@/types'

interface Props {
  data: MemberStat[]
  categories: Category[]
}

const MemberStackBar: FC<Props> = ({ data, categories }) => {
  const formatted = data.map((m) => {
    const row: Record<string, string | number> = { name: m.member.name }
    categories.forEach((c) => {
      const found = m.byCategory.find((bc) => bc.category.id === c.id)
      row[c.name] = found?.amount ?? 0
    })
    return row
  })

  if (formatted.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-gray-600">
        本月尚無資料
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#868E96' }} />
        <YAxis
          tick={{ fontSize: 11, fill: '#868E96' }}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {categories.map((c) => (
          <Bar key={c.id} dataKey={c.name} stackId="a" fill={c.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default MemberStackBar
