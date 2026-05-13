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
  data: { yearMonth: string; income: number; expense: number }[]
}

const TrendLineChart: FC<Props> = ({ data }) => {
  const formatted = data.map((d) => ({
    name: shortMonth(d.yearMonth),
    收入: d.income,
    支出: d.expense,
  }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#868E96' }} />
        <YAxis
          tick={{ fontSize: 11, fill: '#868E96' }}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="收入"
          stroke="#1D9E75"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="支出"
          stroke="#E24B4A"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default TrendLineChart
