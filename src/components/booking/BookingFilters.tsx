'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, RotateCcw, ChevronDown } from 'lucide-react'

export interface FilterState {
  status: string
  dateRange: string
  villa: string
}

interface BookingFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

const statusOptions = ['All', 'CONFIRMED', 'PENDING', 'CHECKED OUT', 'CANCELLED']
const dateRangeOptions = ['All Time', 'Today', 'This Week', 'This Month', 'Last Month']
const villaOptions = ['All Villas', 'Numi Villa Pangandaran', 'Numi Villa Lembang', 'Numi Villa Bali']

export function BookingFilters({ filters, onFilterChange }: BookingFiltersProps) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [villaOpen, setVillaOpen] = useState(false)

  const handleReset = () => {
    onFilterChange({ status: 'All', dateRange: 'All Time', villa: 'All Villas' })
  }

  const hasActiveFilters =
    filters.status !== 'All' ||
    filters.dateRange !== 'All Time' ||
    filters.villa !== 'All Villas'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center gap-2 text-(--text-muted) mr-2">
        <Filter size={16} />
        <span className="text-sm font-medium">Filters</span>
      </div>

      {/* Status Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setStatusOpen(!statusOpen)
            setDateOpen(false)
            setVillaOpen(false)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-(--surface)"
          style={{
            borderColor: statusOpen ? 'var(--accent)' : 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--foreground)',
          }}
        >
          {filters.status === 'All' ? 'Status' : filters.status}
          <ChevronDown size={14} className="text-(--text-muted)" />
        </button>
        {statusOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setStatusOpen(false)} />
            <div
              className="absolute top-full left-0 mt-2 w-44 rounded-xl border shadow-lg z-40 py-1.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {statusOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange({ ...filters, status: opt })
                    setStatusOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-(--background) transition-colors"
                  style={{
                    color: filters.status === opt ? 'var(--accent)' : 'var(--foreground)',
                    fontWeight: filters.status === opt ? 600 : 400,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Date Range Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setDateOpen(!dateOpen)
            setStatusOpen(false)
            setVillaOpen(false)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-(--surface)"
          style={{
            borderColor: dateOpen ? 'var(--accent)' : 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--foreground)',
          }}
        >
          {filters.dateRange}
          <ChevronDown size={14} className="text-(--text-muted)" />
        </button>
        {dateOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setDateOpen(false)} />
            <div
              className="absolute top-full left-0 mt-2 w-44 rounded-xl border shadow-lg z-40 py-1.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {dateRangeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange({ ...filters, dateRange: opt })
                    setDateOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-(--background) transition-colors"
                  style={{
                    color: filters.dateRange === opt ? 'var(--accent)' : 'var(--foreground)',
                    fontWeight: filters.dateRange === opt ? 600 : 400,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Villa Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setVillaOpen(!villaOpen)
            setStatusOpen(false)
            setDateOpen(false)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-(--surface)"
          style={{
            borderColor: villaOpen ? 'var(--accent)' : 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--foreground)',
          }}
        >
          {filters.villa === 'All Villas' ? 'Villa' : filters.villa}
          <ChevronDown size={14} className="text-(--text-muted)" />
        </button>
        {villaOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setVillaOpen(false)} />
            <div
              className="absolute top-full left-0 mt-2 w-56 rounded-xl border shadow-lg z-40 py-1.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {villaOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange({ ...filters, villa: opt })
                    setVillaOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-(--background) transition-colors"
                  style={{
                    color: filters.villa === opt ? 'var(--accent)' : 'var(--foreground)',
                    fontWeight: filters.villa === opt ? 600 : 400,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
          }}
        >
          <RotateCcw size={14} />
          Reset
        </motion.button>
      )}
    </motion.div>
  )
}
