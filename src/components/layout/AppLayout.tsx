import { FC, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import TransactionModal from '@/components/shared/TransactionModal'
import ToastHost from '@/components/shared/Toast'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useBudgetStore } from '@/store/useBudgetStore'

const AppLayout: FC = () => {
  const fetchCategories = useCategoryStore((s) => s.fetch)
  const fetchMembers = useMemberStore((s) => s.fetch)
  const fetchTx = useTransactionStore((s) => s.fetch)
  const fetchBudgets = useBudgetStore((s) => s.fetch)

  useEffect(() => {
    void fetchCategories()
    void fetchMembers()
    void fetchTx()
    void fetchBudgets()
  }, [fetchCategories, fetchMembers, fetchTx, fetchBudgets])

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <TransactionModal />
      <ToastHost />
    </div>
  )
}

export default AppLayout
