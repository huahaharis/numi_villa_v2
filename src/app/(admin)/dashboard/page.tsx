'use client'

import { motion } from 'framer-motion'
import {
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Star,
  ClipboardCheck,
  FilePlus,
  Building2,
  Users,
  Clock,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import type { ActivityItem } from '@/components/dashboard/RecentActivity'
import Link from 'next/link'

const stats = [
  {
    title: 'Total Bookings',
    value: '1,284',
    change: '12.4%',
    changeType: 'positive' as const,
    icon: CalendarCheck,
  },
  {
    title: 'Total Revenue',
    value: '$142.5k',
    change: '8.2%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    title: 'Occupancy Rate',
    value: '84%',
    change: '2.1%',
    changeType: 'negative' as const,
    icon: TrendingUp,
  },
  {
    title: 'Avg. Rating',
    value: '4.9/5',
    change: 'New',
    changeType: 'neutral' as const,
    icon: Star,
  },
]

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Received',
    description: 'Raden Surya booked Numi Villa Pangandaran',
    timestamp: '2 minutes ago',
    amount: '$320',
  },
  {
    id: '2',
    type: 'checkin',
    title: 'Guest Check-in',
    description: 'Dewi Kartika checked in to Numi Villa Lembang',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    type: 'invoice',
    title: 'Invoice Generated',
    description: 'Invoice #INV-2024-089 for Siti Rahayu',
    timestamp: '3 hours ago',
    amount: '$450',
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    description: 'Bank transfer received from Budi Santoso',
    timestamp: '5 hours ago',
    amount: '$280',
  },
  {
    id: '5',
    type: 'alert',
    title: 'Low Stock Alert',
    description: 'Mineral water stock is below 12 units',
    timestamp: '6 hours ago',
  },
  {
    id: '6',
    type: 'booking',
    title: 'Booking Cancelled',
    description: 'Ahmad Fauzi cancelled booking #B-1042',
    timestamp: '8 hours ago',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          Overview
        </h1>
        <p className="text-sm text-(--text-muted) mt-1">
          Performance metrics for the last 30 days
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - 2/3 width */}
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        {/* Property Status - 1/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border overflow-hidden"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Property Status
            </h3>
          </div>

          {/* Villa Card */}
          <div className="p-6 space-y-6">
            {/* Villa Info */}
            <div className="space-y-4">
              <div
                className="w-full h-32 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--background)' }}
              >
                <Building2
                  size={48}
                  className="text-(--accent)"
                  strokeWidth={1}
                />
              </div>

              <div>
                <h4
                  className="text-lg font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Numi Villa Pangandaran
                </h4>
                <p className="text-sm text-(--text-muted) mt-0.5">
                  3 Bedrooms · 2 Bathrooms · Pool
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Fully Occupied
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px"
              style={{ background: 'var(--border)' }}
            />

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--background)' }}
                  >
                    <Users
                      size={16}
                      className="text-(--accent)"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-(--text-muted)">
                      Current Guests
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      8 people
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--background)' }}
                  >
                    <Clock
                      size={16}
                      className="text-(--accent)"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-(--text-muted)">
                      Check-outs Today
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      03
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px"
              style={{ background: 'var(--border)' }}
            />

            {/* Upcoming */}
            <div>
              <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3">
                Next Check-in
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'var(--accent)',
                    color: '#ffffff',
                  }}
                >
                  RK
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Rina Kartika
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    Today, 14:00 WIB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Shortcuts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border p-6"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Quick Shortcuts
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/inventory">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-medium transition-colors hover:bg-(--background)"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <ClipboardCheck
                size={18}
                style={{ color: 'var(--accent)' }}
              />
              Stock Check
            </motion.button>
          </Link>
          <Link href="/invoices">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-medium transition-colors hover:bg-(--background)"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <FilePlus
                size={18}
                style={{ color: 'var(--accent)' }}
              />
              Generate Invoice
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
