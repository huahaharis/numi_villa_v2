'use client'

import { motion } from 'framer-motion'
import { MoreHorizontal, Eye, FileText } from 'lucide-react'
import { BookingStatusBadge, type BookingStatus } from './BookingStatusBadge'

export interface BookingRow {
  id: string
  guestName: string
  villaName: string
  checkIn: string
  checkOut: string
  status: BookingStatus
  totalAmount: string
}

interface BookingTableProps {
  bookings: BookingRow[]
}

export function BookingTable({ bookings }: BookingTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b text-left"
              style={{ borderColor: 'var(--border)' }}
            >
              {[
                'Guest Name',
                'Villa Name',
                'Check-In',
                'Check-Out',
                'Status',
                'Total Amount',
                'Actions',
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-(--text-muted)"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {bookings.map((booking, index) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group transition-colors hover:bg-(--background)/50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: 'var(--accent)',
                        color: '#ffffff',
                      }}
                    >
                      {booking.guestName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {booking.guestName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-sm"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {booking.villaName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-(--text-muted)">
                    {booking.checkIn}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-(--text-muted)">
                    {booking.checkOut}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {booking.totalAmount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 rounded-lg hover:bg-(--background) transition-colors"
                      title="View Details"
                    >
                      <Eye
                        size={16}
                        className="text-(--text-muted)"
                      />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-(--background) transition-colors"
                      title="View Invoice"
                    >
                      <FileText
                        size={16}
                        className="text-(--text-muted)"
                      />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-(--background) transition-colors"
                      title="More"
                    >
                      <MoreHorizontal
                        size={16}
                        className="text-(--text-muted)"
                      />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-(--text-muted)">
            No bookings found matching your filters.
          </p>
        </div>
      )}
    </motion.div>
  )
}
