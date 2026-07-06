'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Package,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', href: '/bookings', icon: CalendarDays },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-(--sidebar-bg) text-white lg:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop: always visible, Mobile: slide in */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-full w-64 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-8">
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col"
            >
              <span
                className="text-2xl font-bold tracking-widest"
                style={{ color: 'var(--accent)' }}
              >
                NUMI
              </span>
              <span className="text-[10px] font-medium tracking-[0.25em] text-gray-500 uppercase mt-0.5">
                VILLA MGMT
              </span>
            </motion.div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                  style={isActive ? { background: 'rgba(255,255,255,0.12)' } : {}}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-4 pb-6 space-y-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/bookings/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'var(--accent)',
                color: '#ffffff',
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              New Booking
            </Link>
          </motion.div>

          <button
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
