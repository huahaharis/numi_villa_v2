    import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Numi Villa | Admin Dashboard',
  description: 'Villa management dashboard for Numi Villa Pangandaran',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
