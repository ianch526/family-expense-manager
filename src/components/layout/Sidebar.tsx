import { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/store/useUIStore'

const NAV = [
  { to: '/', label: '總覽', icon: '◐', exact: true },
  { to: '/transactions', label: '交易記錄', icon: '☰' },
  { to: '/budget', label: '預算管理', icon: '◧' },
  { to: '/analytics/category', label: '分類統計', icon: '◔' },
  { to: '/analytics/member', label: '成員統計', icon: '◯' },
  { to: '/settings/categories', label: '分類設定', icon: '⚙' },
  { to: '/settings/members', label: '成員設定', icon: '⌂' },
]

const Sidebar: FC = () => {
  const openModal = useUIStore((s) => s.openTransactionModal)

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-gray-200 bg-white px-4 py-5 gap-2">
      <div className="px-2 py-3 mb-2">
        <div className="text-xs text-gray-600">家庭支出管理</div>
        <div className="text-lg font-bold text-brand">FamilyBook</div>
      </div>

      <button className="btn-primary w-full mb-3" onClick={() => openModal()}>
        ＋ 新增交易
      </button>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <span className="text-base w-5 text-center" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2 py-3 text-xs text-gray-600 border-t border-gray-100">
        v1.0 · 規格符合 §5.1
      </div>
    </aside>
  )
}

export default Sidebar
