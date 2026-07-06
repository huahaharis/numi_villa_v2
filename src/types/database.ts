// ────────────────────────────────────────────────
//  Enums
// ────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'overdue' | 'partial' | 'refunded'

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export type ActivityType = 'booking_created' | 'booking_updated' | 'booking_cancelled' | 'invoice_created' | 'invoice_paid' | 'inventory_updated' | 'guest_created' | 'guest_updated' | 'check_in' | 'check_out' | 'user_login' | 'user_logout' | 'settings_updated' | 'other'

// ────────────────────────────────────────────────
//  Core Types
// ────────────────────────────────────────────────

export interface Villa {
  id: string
  name: string
  slug: string
  description: string | null
  tagline: string | null
  location: string | null
  address: string | null
  bedrooms: number
  bathrooms: number
  maxGuests: number
  propertyType: string
  baseRatePerNight: number
  currency: string
  amenities: string[]
  features: string[]
  coverImage: string | null
  galleryImages: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface Guest {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  address: string | null
  city: string | null
  country: string | null
  postalCode: string | null
  idType: string | null
  idNumber: string | null
  preferences: Record<string, unknown> | null
  internalNotes: string | null
  totalBookings: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  bookingCode: string
  villaId: string
  guestId: string
  checkIn: string
  checkOut: string
  numNights: number
  adults: number
  children: number
  infants: number
  totalGuests: number
  baseRatePerNight: number
  seasonAdjustment: string | null
  rateMultiplier: number
  adjustedRate: number
  subtotal: number
  serviceFee: number
  serviceFeePercent: number
  taxes: number
  taxPercent: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: BookingStatus
  cancelledAt: string | null
  cancellationReason: string | null
  refundAmount: number | null
  refundStatus: string | null
  guestNotes: string | null
  internalNotes: string | null
  source: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  bookingId: string | null
  villaId: string
  guestId: string
  invoiceDate: string
  dueDate: string | null
  paidDate: string | null
  billedToName: string
  billedToEmail: string | null
  billedToPhone: string | null
  billedToAddress: string | null
  stayVillaName: string | null
  stayNights: number | null
  stayCheckIn: string | null
  stayCheckOut: string | null
  subtotal: number
  serviceCharge: number
  serviceChargePct: number
  vatAmount: number
  vatPercent: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  paymentStatus: string
  paymentMethod: string | null
  bankName: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankBranch: string | null
  status: InvoiceStatus
  internalNotes: string | null
  terms: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  sentAt: string | null
  viewedAt: string | null
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  serviceId: string | null
  description: string
  category: string
  quantity: number
  unit_price: number
  currency: string
  total_price: number
  tag: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  category: string | null
  unitPrice: number
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SeasonalRate {
  id: string
  villaId: string
  name: string
  startDate: string
  endDate: string
  pricePerNight: number
  minNights: number
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string | null
  description: string | null
  quantity: number
  minQuantity: number
  unit: string
  status: InventoryStatus
  location: string | null
  supplier: string | null
  costPerUnit: number | null
  lastRestockedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  type: ActivityType
  entityType: string
  entityId: string | null
  description: string
  metadata: Record<string, unknown> | null
  userId: string | null
  userName: string | null
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  role: 'admin' | 'manager' | 'staff'
  phone: string | null
  isActive: boolean
  lastLoginAt: string | null
  preferences: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// ────────────────────────────────────────────────
//  Join / Expanded Types
// ────────────────────────────────────────────────

export interface BookingWithRelations extends Booking {
  villa?: Villa
  guest?: Guest
  invoice?: Invoice
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
  villa?: Villa
  booking?: Booking
}

export interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  occupancyRate: number
  upcomingCheckIns: number
  upcomingCheckOuts: number
  pendingInvoices: number
  lowStockItems: number
  recentActivity: ActivityLog[]
}
