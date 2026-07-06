'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon }: StatCardProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-emerald-600'
      : changeType === 'negative'
        ? 'text-red-500'
        : 'text-(--text-muted)'

  const changeBg =
    changeType === 'positive'
      ? 'bg-emerald-50'
      : changeType === 'negative'
        ? 'bg-red-50'
        : 'bg-(--background)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl border p-6 transition-shadow hover:shadow-md"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Icon */}
      <div
        className="absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <Icon size={20} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-(--text-muted)">{title}</p>
        <p
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {value}
        </p>

        {change && (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${changeColor} ${changeBg}`}
          >
            {changeType === 'positive' && '+'}
            {changeType === 'negative' && ''}
            {change}
          </span>
        )}
      </div>
    </motion.div>
  )
}
