import { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/store/useUIStore'

type Tab =
  | { to: string; label: string; icon: string; exact?: boolean }
  | { add: true; label: string; icon: string }

const TABS: Tab[] = [
  { to: '/', label: '總覽', icon: '◐', exact: true },
  { to: '/transactions', label: '交易', icon: '☰' },
  { add: true, label: '新增', icon: '＋' },
  { to: '/budget', label: '預算', icon: '◧' },
  { to: '/settings/categories', label: '設定', icon: '⚙' },
]

const MobileNav: FC = () => {
  const openModal = useUIStore((s) => s.openTransactionModal)

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 grid grid-cols-5">
      {TABS.map((t, i) => {
        if ('add' in t) {
          return (
            <button
              key={i}
              onClick={() => openModal()}
              className="flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <span className="w-10 h-10 -mt-5 rounded-full bg-brand text-white flex items-center justify-center text-xl shadow-md">
                {t.icon}
              </span>
              <span className="text-[10px] text-gray-600">{t.label}</span>
            </button>
          )
        }
        return (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2.5 gap-0.5 ${
                isActive ? 'text-brand' : 'text-gray-600'
              }`
            }
          >
            <span className="text-lg" aria-hidden>
              {t.icon}
            </span>
            <span className="text-[11px] font-medium">{t.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default MobileNav
