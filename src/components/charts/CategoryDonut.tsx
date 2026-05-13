import { FC } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'

interface DataItem {
  name: string
  value: number
  color: string
}

interface Props {
  data: DataItem[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
}

const CategoryDonut: FC<Props> = ({
  data,
  height = 260,
  innerRadius = 55,
  outerRadius = 90,
  showLegend = true,
}) => {
  if (data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-sm text-gray-600"
      >
        本月尚無支出資料
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CategoryDonut
