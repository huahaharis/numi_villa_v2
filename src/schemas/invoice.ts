import { z } from 'zod'

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number().min(1, 'Min 1'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  totalPrice: z.number(),
})

// Form schema: only fields that are actually rendered/registered in the UI.
// Invoice date and due date are derived from the stay dates.
export const invoiceSchema = z.object({
  villaId: z.string().uuid('Select a villa'),
  bookingId: z.string().uuid().optional(),
  guestName: z.string().min(2, 'Guest name required'),
  guestEmail: z.string().email().optional().or(z.literal('')),
  guestPhone: z.string().optional(),
  guestAddress: z.string().optional(),
  stayCheckIn: z.string().min(1, 'Check-in date required'),
  stayCheckOut: z.string().min(1, 'Check-out date required'),
  serviceChargePercent: z.number(),
  vatPercent: z.number(),
  internalNotes: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemSchema>

// Payload sent to the Server Action; line items are managed outside the form.
export type InvoicePayload = InvoiceFormData & {
  lineItems: InvoiceLineItemInput[]
}
