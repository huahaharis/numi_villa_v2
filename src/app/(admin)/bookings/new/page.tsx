'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Baby,
  Home,
  Calendar,
  Mail,
  Phone,
  User,
  FileText,
  Check,
} from 'lucide-react'
import Link from 'next/link'

type Step = 1 | 2

const villas = [
  {
    id: 'v1',
    name: 'Numi Villa Pangandaran',
    location: 'Pangandaran, West Java',
    price: 120,
    image: null,
  },
  {
    id: 'v2',
    name: 'Numi Villa Lembang',
    location: 'Lembang, West Java',
    price: 150,
    image: null,
  },
  {
    id: 'v3',
    name: 'Numi Villa Bali',
    location: 'Ubud, Bali',
    price: 200,
    image: null,
  },
]

export default function NewBookingPage() {
  const [step, setStep] = useState<Step>(1)
  const [selectedVilla, setSelectedVilla] = useState<string>('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const selectedVillaData = villas.find((v) => v.id === selectedVilla)

  // Calculate summary
  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0
  const baseRate = selectedVillaData ? selectedVillaData.price * nights : 0
  const serviceFee = baseRate * 0.05
  const taxes = baseRate * 0.1
  const total = baseRate + serviceFee + taxes

  const canProceedStep1 = selectedVilla && checkIn && checkOut
  const canProceedStep2 = fullName && email && phone

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm"
      >
        <Link
          href="/dashboard"
          className="text-(--text-muted) hover:text-(--accent) transition-colors"
        >
          Dashboard
        </Link>
        <ChevronLeft size={14} className="text-(--text-muted) rotate-180" />
        <Link
          href="/bookings"
          className="text-(--text-muted) hover:text-(--accent) transition-colors"
        >
          Bookings
        </Link>
        <ChevronLeft size={14} className="text-(--text-muted) rotate-180" />
        <span className="font-medium" style={{ color: 'var(--foreground)' }}>
          New Booking
        </span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          New Booking
        </h1>
        <p className="text-sm text-(--text-muted) mt-1">
          Create a new reservation for your guest
        </p>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4"
      >
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
              style={{
                background:
                  step >= s ? 'var(--accent)' : 'var(--border)',
                color: step >= s ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              {step > s ? <Check size={14} /> : s}
            </div>
            <span
              className="text-sm font-medium"
              style={{
                color: step >= s ? 'var(--foreground)' : 'var(--text-muted)',
              }}
            >
              {s === 1 ? 'Stay Details' : 'Guest Information'}
            </span>
            {s === 1 && (
              <ChevronRight size={16} className="text-(--border)" />
            )}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border p-6 space-y-6"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Stay Details
                </h2>

                {/* Villa Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-(--text-muted)">
                    Select Villa
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {villas.map((villa) => (
                      <motion.button
                        key={villa.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedVilla(villa.id)}
                        className="relative p-4 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor:
                            selectedVilla === villa.id
                              ? 'var(--accent)'
                              : 'var(--border)',
                          background:
                            selectedVilla === villa.id
                              ? 'var(--background)'
                              : 'var(--surface)',
                        }}
                      >
                        {selectedVilla === villa.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--accent)' }}
                          >
                            <Check size={12} className="text-white" />
                          </motion.div>
                        )}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                          style={{ background: 'var(--background)' }}
                        >
                          <Home
                            size={20}
                            style={{ color: 'var(--accent)' }}
                          />
                        </div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {villa.name}
                        </p>
                        <p className="text-xs text-(--text-muted) mt-0.5">
                          {villa.location}
                        </p>
                        <p
                          className="text-sm font-bold mt-2"
                          style={{ color: 'var(--accent)' }}
                        >
                          ${villa.price}
                          <span className="text-xs font-normal text-(--text-muted)">
                            /night
                          </span>
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-(--text-muted) flex items-center gap-2">
                      <Calendar size={14} />
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-(--text-muted) flex items-center gap-2">
                      <Calendar size={14} />
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                </div>

                {/* Guest Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-(--text-muted) flex items-center gap-2">
                      <Users size={14} />
                      Adults
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-(--foreground) hover:bg-(--background) transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        -
                      </button>
                      <span
                        className="w-12 text-center text-lg font-semibold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {adults}
                      </span>
                      <button
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-(--foreground) hover:bg-(--background) transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-(--text-muted) flex items-center gap-2">
                      <Baby size={14} />
                      Children
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-(--foreground) hover:bg-(--background) transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        -
                      </button>
                      <span
                        className="w-12 text-center text-lg font-semibold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {children}
                      </span>
                      <button
                        onClick={() => setChildren(Math.min(6, children + 1))}
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-(--foreground) hover:bg-(--background) transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border p-6 space-y-6"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Guest Information
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-(--text-muted) flex items-center gap-2">
                      <User size={14} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter guest full name"
                      className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-(--text-muted) flex items-center gap-2">
                      <Mail size={14} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guest@email.com"
                      className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-(--text-muted) flex items-center gap-2">
                      <Phone size={14} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812 3456 7890"
                      className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                </div>

                {/* Rate display */}
                {selectedVillaData && (
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--background)' }}
                  >
                    <p className="text-xs text-(--text-muted) mb-1">
                      Rate per night
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: 'var(--accent)' }}
                    >
                      ${selectedVillaData.price}
                      <span className="text-sm font-normal text-(--text-muted)">
                        /night
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            {step === 2 ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <ChevronLeft size={16} />
                Back
              </motion.button>
            ) : (
              <Link href="/bookings">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <ChevronLeft size={16} />
                  Cancel
                </motion.button>
              </Link>
            )}

            {step === 1 ? (
              <motion.button
                whileHover={{ scale: canProceedStep1 ? 1.02 : 1 }}
                whileTap={{ scale: canProceedStep1 ? 0.98 : 1 }}
                onClick={() => canProceedStep1 && setStep(2)}
                disabled={!canProceedStep1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                style={{
                  background: 'var(--accent)',
                  color: '#ffffff',
                }}
              >
                Continue
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: canProceedStep2 ? 1.02 : 1 }}
                whileTap={{ scale: canProceedStep2 ? 0.98 : 1 }}
                disabled={!canProceedStep2}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                style={{
                  background: 'var(--accent)',
                  color: '#ffffff',
                }}
              >
                <FileText size={16} />
                Preview Invoice & Finalize
              </motion.button>
            )}
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border p-6 space-y-6 h-fit"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Booking Summary
          </h3>

          {/* Villa */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--background)' }}
              >
                <Home size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  {selectedVillaData?.name || 'Select a villa'}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {selectedVillaData?.location || '—'}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--background)' }}
              >
                <Calendar size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  {checkIn && checkOut
                    ? `${new Date(checkIn).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })} - ${new Date(checkOut).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : 'Select dates'}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {nights > 0 ? `${nights} nights` : '—'}
                </p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--background)' }}
              >
                <Users size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  {adults + children} Guest{adults + children !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {adults} adult{adults !== 1 ? 's' : ''}
                  {children > 0
                    ? `, ${children} child${children !== 1 ? 'ren' : ''}`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px"
            style={{ background: 'var(--border)' }}
          />

          {/* Pricing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-muted)">
                Base Rate ({nights} night{nights !== 1 ? 's' : ''})
              </span>
              <span style={{ color: 'var(--foreground)' }}>
                ${baseRate.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-muted)">Service Fee (5%)</span>
              <span style={{ color: 'var(--foreground)' }}>
                ${serviceFee.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-muted)">Taxes (10%)</span>
              <span style={{ color: 'var(--foreground)' }}>
                ${taxes.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px"
            style={{ background: 'var(--border)' }}
          />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Estimated Total
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--accent)' }}
            >
              ${total.toFixed(2)}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
