export interface InvoiceLine {
  id: string
  description: string
  detail?: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoiceData {
  status: string
  paymentStatus: string
  invoiceNumber: string
  date: string
  dueDate: string
  guestName: string
  guestEmail: string
  guestPhone: string
  guestAddress: string
  villaName: string
  nights: number
  checkIn: string
  checkOut: string
  lineItems: InvoiceLine[]
  subtotal: number
  serviceChargeRate: number
  serviceCharge: number
  vatRate: number
  vat: number
  total: number
  currency: string
  bankName: string
  accountName: string
  accountNumber: string
  branch: string
  thankYouMessage: string
}

export const invoiceData: InvoiceData = {
  status: 'DRAFT',
  paymentStatus: 'unpaid',
  invoiceNumber: 'INV-2024-082',
  date: 'Aug 14, 2024',
  dueDate: 'Aug 21, 2024',

  guestName: 'Julian Alexander Sterling',
  guestEmail: 'abeyharris@gmail.com',
  guestPhone: '+44 7700 900077',
  guestAddress: 'Kensington Gardens, London, UK',

  villaName: 'Numi Villa Pangandaran',
  nights: 5,
  checkIn: 'Aug 21, 2024',
  checkOut: 'Aug 26, 2024',

  lineItems: [
    {
      id: '1',
      description: 'Accommodation (Numi Villa Pangandaran)',
      detail: 'Includes private pool, butler service, daily housekeeping',
      quantity: 5,
      unitPrice: 1250000.0,
      amount: 6250000.0,
    },
  ],

  subtotal: 7360000.0,
  serviceChargeRate: 10,
  serviceCharge: 736000.0,
  vatRate: 11,
  vat: 809100.0,
  total: 8845100.0,
  currency: 'IDR',

  bankName: 'Central Bank of Indonesia',
  accountName: 'PT Numi Villa Indonesia',
  accountNumber: '1234-5678-9012-3456',
  branch: 'Bandung, Jawa Barat',

  thankYouMessage:
    'It was a pleasure hosting you, Julian. We look forward to welcoming you back at Numi Villa.',
}
