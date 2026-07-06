'use client'

import { motion } from 'framer-motion'

export type BookingStatus = 'CONFIRMED' | 'CHECKED OUT' | 'CANCELLED' | 'PENDING'

interface BookingStatusBadgeProps {
  status: BookingStatus
}

const statusStyles: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
  CONFIRMED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'CHECKED OUT': {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  CANCELLED: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const style = statusStyles[status]

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </motion.span>
  )
}
