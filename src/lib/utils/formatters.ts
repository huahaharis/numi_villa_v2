export function formatCurrency(amount: number | undefined | null, currency: string = 'IDR'): string {
  const value = amount ?? 0
  if (currency === 'IDR') {
    return `IDR ${value.toLocaleString('id-ID')}`
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 0)
}

export function calculateInvoiceTotals(
  lineItems: { quantity: number; unitPrice: number }[],
  serviceChargePercent: number = 10,
  vatPercent: number = 11
) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const serviceCharge = subtotal * (serviceChargePercent / 100)
  const vatAmount = (subtotal + serviceCharge) * (vatPercent / 100)
  const total = subtotal + serviceCharge + vatAmount
  return { subtotal, serviceCharge, vatAmount, total }
}
