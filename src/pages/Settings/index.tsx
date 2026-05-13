import { FC } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { resetAllData } from '@/services/storage'
import { useUIStore } from '@/store/useUIStore'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useBudgetStore } from '@/store/useBudgetStore'
import { useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const Settings: FC = () => {
  const pushToast = useUIStore((s) => s.pushToast)
  const fetchTx = useTransactionStore((s) => s.fetch)
  const fetchCat = useCategoryStore((s) => s.fetch)
  const fetchMem = useMemberStore((s) => s.fetch)
  const fetchBud = useBudgetStore((s) => s.fetch)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = async () => {
    resetAllData()
    await Promise.all([fetchCat(), fetchMem(), fetchTx(), fetchBud()])
    pushToast({ type: 'success', message: '已重設為預設資料' })
    setConfirmReset(false)
  }

  return (
    <div className="space-y-4">
      <div className="card p-2 inline-flex gap-1">
        <NavLink
          to="categories"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              isActive ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          分類管理
        </NavLink>
        <NavLink
          to="members"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              isActive ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          成員管理
        </NavLink>
      </div>
      <Outlet />

      <div className="card p-4 sm:p-5 border-t-4 border-t-warning/40">
        <h3 className="text-base font-bold mb-1">資料管理</h3>
        <p className="text-xs text-gray-600 mb-3">
          資料儲存於瀏覽器 localStorage。重設將清除所有交易、分類、成員、預算並還原為預設範例。
        </p>
        <button className="btn-secondary" onClick={() => setConfirmReset(true)}>
          重設為預設資料
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="確定要重設？"
        message="這將清除所有資料並還原為內建範例，無法還原。"
        variant="danger"
        confirmText="重設"
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
      />
    </div>
  )
}

export default Settings
