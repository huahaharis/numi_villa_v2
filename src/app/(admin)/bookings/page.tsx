'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { BookingFilters } from '@/components/booking/BookingFilters'
import { BookingTable } from '@/components/booking/BookingTable'
import type { BookingRow } from '@/components/booking/BookingTable'
import type { FilterState } from '@/components/booking/BookingFilters'

const allBookings: BookingRow[] = [
  {
    id: 'B-1045',
    guestName: 'Raden Surya',
    villaName: 'Numi Villa Pangandaran',
    checkIn: 'Jan 15, 2026',
    checkOut: 'Jan 18, 2026',
    status: 'CONFIRMED',
    totalAmount: '$320',
  },
  {
    id: 'B-1044',
    guestName: 'Dewi Kartika',
    villaName: 'Numi Villa Lembang',
    checkIn: 'Jan 14, 2026',
    checkOut: 'Jan 16, 2026',
    status: 'CHECKED OUT',
    totalAmount: '$450',
  },
  {
    id: 'B-1043',
    guestName: 'Budi Santoso',
    villaName: 'Numi Villa Pangandaran',
    checkIn: 'Jan 12, 2026',
    checkOut: 'Jan 14, 2026',
    status: 'CONFIRMED',
    totalAmount: '$280',
  },
  {
    id: 'B-1042',
    guestName: 'Ahmad Fauzi',
    villaName: 'Numi Villa Bali',
    checkIn: 'Jan 10, 2026',
    checkOut: 'Jan 15, 2026',
    status: 'CANCELLED',
    totalAmount: '$650',
  },
  {
    id: 'B-1041',
    guestName: 'Siti Rahayu',
    villaName: 'Numi Villa Pangandaran',
    checkIn: 'Jan 8, 2026',
    checkOut: 'Jan 11, 2026',
    status: 'CHECKED OUT',
    totalAmount: '$450',
  },
  {
    id: 'B-1040',
    guestName: 'Hendra Wijaya',
    villaName: 'Numi Villa Lembang',
    checkIn: 'Jan 5, 2026',
    checkOut: 'Jan 8, 2026',
    status: 'CONFIRMED',
    totalAmount: '$510',
  },
  {
    id: 'B-1039',
    guestName: 'Maya Anggraini',
    villaName: 'Numi Villa Pangandaran',
    checkIn: 'Jan 3, 2026',
    checkOut: 'Jan 6, 2026',
    status: 'CHECKED OUT',
    totalAmount: '$380',
  },
  {
    id: 'B-1038',
    guestName: 'Rina Kartika',
    villaName: 'Numi Villa Bali',
    checkIn: 'Jan 1, 2026',
    checkOut: 'Jan 4, 2026',
    status: 'CONFIRMED',
    totalAmount: '$720',
  },
  {
    id: 'B-1037',
    guestName: 'Andi Pratama',
    villaName: 'Numi Villa Pangandaran',
    checkIn: 'Dec 28, 2025',
    checkOut: 'Dec 31, 2025',
    status: 'CHECKED OUT',
    totalAmount: '$340',
  },
  {
    id: 'B-1036',
    guestName: 'Lisa Susanti',
    villaName: 'Numi Villa Lembang',
    checkIn: 'Dec 25, 2025',
    checkOut: 'Dec 28, 2025',
    status: 'CONFIRMED',
    totalAmount: '$480',
  },
]

const ITEMS_PER_PAGE = 7

export default function BookingsPage() {
  const [filters, setFilters] = useState<FilterState>({
    status: 'All',
    dateRange: 'All Time',
    villa: 'All Villas',
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Filter bookings
  const filteredBookings = allBookings.filter((booking) => {
    if (filters.status !== 'All' && booking.status !== filters.status) return false
    if (filters.villa !== 'All Villas' && booking.villaName !== filters.villa) return false
    return true
  })

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            Bookings
          </h1>
          <p className="text-sm text-(--text-muted) mt-1">
            Manage all villa bookings and reservations
          </p>
        </div>
        <Link href="/bookings/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'var(--accent)',
              color: '#ffffff',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            New Booking
          </motion.button>
        </Link>
      </motion.div>

      {/* Filters */}
      <BookingFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Table */}
      <BookingTable bookings={paginatedBookings} />

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between pt-4"
        >
          <p className="text-sm text-(--text-muted)">
            Showing{' '}
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              {startIndex + 1}
            </span>{' '}
            -{' '}
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)}
            </span>{' '}
            of{' '}
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              {filteredBookings.length}
            </span>{' '}
            bookings
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--surface)"
              style={{ borderColor: 'var(--border)' }}
            >
              <ChevronLeft size={16} className="text-(--foreground)" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background:
                    page === currentPage ? 'var(--accent)' : 'transparent',
                  color: page === currentPage ? '#ffffff' : 'var(--foreground)',
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--surface)"
              style={{ borderColor: 'var(--border)' }}
            >
              <ChevronRight size={16} className="text-(--foreground)" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
