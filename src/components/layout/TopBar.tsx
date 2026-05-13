import { FC } from 'react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/useUIStore'

const TITLES: Record<string, string> = {
  '/': '總覽 Dashboard',
  '/transactions': '交易記錄',
  '/budget': '預算管理',
  '/analytics/category': '分類統計',
  '/analytics/member': '成員統計',
  '/settings/categories': '分類管理',
  '/settings/members': '成員管理',
}

const TopBar: FC = () => {
  const { pathname } = useLocation()
  const openModal = useUIStore((s) => s.openTransactionModal)

  const title = TITLES[pathname] ?? '家庭支出管理'

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <h1 className="text-base sm:text-xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          className="hidden sm:inline-flex btn-primary"
          onClick={() => openModal()}
        >
          ＋ 新增交易
        </button>
      </div>
    </header>
  )
}

export default TopBar
