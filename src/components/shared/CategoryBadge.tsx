import { FC } from 'react'
import type { Category } from '@/types'

interface Props {
  category: Category
  size?: 'sm' | 'md'
}

const CategoryBadge: FC<Props> = ({ category, size = 'sm' }) => {
  const padding = size === 'sm' ? 'px-2.5 py-0.5' : 'px-3 py-1'
  const text = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${padding} ${text}`}
      style={{ backgroundColor: category.lightColor, color: category.color }}
    >
      {category.name}
    </span>
  )
}

export default CategoryBadge
