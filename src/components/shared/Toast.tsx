import { FC } from 'react'
import { useUIStore } from '@/store/useUIStore'

const ToastHost: FC = () => {
  const toasts = useUIStore((s) => s.toasts)
  const remove = useUIStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-xs">
      {toasts.map((t) => {
        const tone =
          t.type === 'success'
            ? 'bg-income text-white'
            : t.type === 'error'
              ? 'bg-expense text-white'
              : 'bg-info text-white'
        return (
          <button
            key={t.id}
            onClick={() => remove(t.id)}
            className={`text-left px-4 py-3 rounded-lg shadow-md text-sm font-medium ${tone}`}
          >
            {t.message}
          </button>
        )
      })}
    </div>
  )
}

export default ToastHost
