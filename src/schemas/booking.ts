import { z } from 'zod'

export const bookingSchema = z.object({
  villaId: z.string().uuid('Select a villa'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  adults: z.number().min(1, 'At least 1 adult required'),
  children: z.number().min(0).default(0),
  infants: z.number().min(0).default(0),
  guestName: z.string().min(2, 'Name is required'),
  guestEmail: z.string().email('Valid email required').optional().or(z.literal('')),
  guestPhone: z.string().min(1, 'Phone number is required'),
  guestNotes: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>
