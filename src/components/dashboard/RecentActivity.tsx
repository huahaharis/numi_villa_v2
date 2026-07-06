'use client'

import { motion } from 'framer-motion'
import {
  CalendarCheck,
  FileText,
  AlertTriangle,
  UserCheck,
  CreditCard,
  ChevronRight,
} from 'lucide-react'

export type ActivityType = 'booking' | 'invoice' | 'alert' | 'checkin' | 'payment'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  amount?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

const activityConfig: Record<
  ActivityType,
  { icon: typeof CalendarCheck; iconBg: string; iconColor: string }
> = {
  booking: {
    icon: CalendarCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  invoice: {
    icon: FileText,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  alert: {
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  checkin: {
    icon: UserCheck,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  payment: {
    icon: CreditCard,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          Recent Activity
        </h3>
        <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}>
          View All
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type]
          const Icon = config.icon

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.3 }}
              className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-(--background)/50"
            >
              {/* Icon */}
              <div
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.iconBg}`}
              >
                <Icon size={18} className={config.iconColor} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--foreground)' }}
                >
                  {activity.title}
                </p>
                <p className="text-xs text-(--text-muted) mt-0.5">
                  {activity.description}
                </p>
                <p className="text-[11px] text-(--text-muted) mt-1.5 opacity-70">
                  {activity.timestamp}
                </p>
              </div>

              {/* Amount */}
              {activity.amount && (
                <span
                  className="text-sm font-semibold shrink-0"
                  style={{ color: 'var(--foreground)' }}
                >
                  {activity.amount}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
