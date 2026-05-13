import { FC } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const Analytics: FC = () => {
  return (
    <div className="space-y-4">
      <div className="card p-2 inline-flex gap-1">
        <NavLink
          to="category"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              isActive ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          分類統計
        </NavLink>
        <NavLink
          to="member"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              isActive ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          成員統計
        </NavLink>
      </div>
      <Outlet />
    </div>
  )
}

export default Analytics
