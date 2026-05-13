import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Budget from '@/pages/Budget'
import Analytics from '@/pages/Analytics'
import CategoryStats from '@/pages/Analytics/CategoryStats'
import MemberStats from '@/pages/Analytics/MemberStats'
import Settings from '@/pages/Settings'
import CategoryManage from '@/pages/Settings/CategoryManage'
import MemberManage from '@/pages/Settings/MemberManage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'budget', element: <Budget /> },
      {
        path: 'analytics',
        element: <Analytics />,
        children: [
          { index: true, element: <Navigate to="category" replace /> },
          { path: 'category', element: <CategoryStats /> },
          { path: 'member', element: <MemberStats /> },
        ],
      },
      {
        path: 'settings',
        element: <Settings />,
        children: [
          { index: true, element: <Navigate to="categories" replace /> },
          { path: 'categories', element: <CategoryManage /> },
          { path: 'members', element: <MemberManage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="h-full flex items-center justify-center text-gray-600">
        頁面不存在 ·{' '}
        <a href="/" className="text-brand underline ml-1">
          回首頁
        </a>
      </div>
    ),
  },
])
