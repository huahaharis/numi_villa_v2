'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react'

function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return ['Dashboard']
  return segments.map((s) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')
  )
}

export function AdminTopbar() {
  const pathname = usePathname()
  const [searchFocused, setSearchFocused] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const breadcrumb = getBreadcrumb(pathname)

  return (
    <header
      className="flex items-center justify-between px-6 md:px-8 py-4 border-b"
      style={{
        background: 'var(--background)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left: Breadcrumb */}
      <nav className="hidden md:flex items-center gap-2 text-sm ml-8 lg:ml-0">
        {breadcrumb.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-(--text-muted)">/</span>
            )}
            <span
              className={
                i === breadcrumb.length - 1
                  ? 'font-semibold text-(--foreground)'
                  : 'text-(--text-muted)'
              }
            >
              {crumb}
            </span>
          </div>
        ))}
      </nav>

      {/* Mobile: just page title */}
      <div className="md:hidden ml-12">
        <span className="text-sm font-semibold text-(--foreground)">
          {breadcrumb[breadcrumb.length - 1]}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search */}
        <motion.div
          animate={{ width: searchFocused ? 280 : 240 }}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all"
          style={{
            borderColor: searchFocused ? 'var(--accent)' : 'var(--border)',
            background: 'var(--surface)',
          }}
        >
          <Search size={16} className="text-(--text-muted) shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-sm outline-none w-full placeholder:text-(--text-muted)"
            style={{ color: 'var(--foreground)' }}
          />
        </motion.div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 rounded-xl border transition-colors hover:bg-(--surface)"
          style={{ borderColor: 'var(--border)' }}
        >
          <Bell size={18} className="text-(--foreground)" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </motion.button>

        {/* User Profile */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-colors hover:bg-(--surface)"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent)', color: '#ffffff' }}
            >
              AD
            </div>
            <span className="hidden md:block text-sm font-medium text-(--foreground)">
              Admin
            </span>
            <ChevronDown
              size={14}
              className="text-(--text-muted) transition-transform"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-lg z-50 py-1.5"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-(--foreground) hover:bg-(--background) transition-colors">
                    <User size={16} className="text-(--text-muted)" />
                    Profile
                  </button>
                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-(--foreground) hover:bg-(--background) transition-colors">
                    <Settings size={16} className="text-(--text-muted)" />
                    Settings
                  </button>
                  <div
                    className="mx-3 my-1.5 h-px"
                    style={{ background: 'var(--border)' }}
                  />
                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-lg mx-1 w-[calc(100%-8px)]">
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
