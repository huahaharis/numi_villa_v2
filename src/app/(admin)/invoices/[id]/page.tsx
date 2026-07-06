import React from "react";
import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/invoices/queries";
import { formatDate } from "@/lib/utils/formatters";
import type { InvoiceData } from "@/data/invoiceData";
import type { InvoiceWithItems } from "@/types/database";
import { InvoicePreview } from "./InvoicePreview";

interface InvoicePreviewPageProps {
  params: Promise<{ id: string }>;
}

function mapInvoiceToPreviewData(invoice: InvoiceWithItems): InvoiceData {
  const nights =
    invoice.stayNights ??
    (invoice.booking?.checkIn && invoice.booking?.checkOut
      ? Math.max(
          Math.ceil(
            (new Date(invoice.booking.checkOut).getTime() -
              new Date(invoice.booking.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          0
        )
      : 1);
console.log("[mapInvoiceToPreviewData] nights:", invoice);
  return {
    status: invoice.status.toUpperCase(),
    paymentStatus: invoice.paymentStatus || "unpaid",
    invoiceNumber: invoice.invoiceNumber,
    date: formatDate(invoice.invoiceDate),
    dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : "—",
    guestName: invoice.billedToName,
    guestEmail: invoice.billedToEmail || "—",
    guestPhone: invoice.billedToPhone || "—",
    guestAddress: invoice.billedToAddress || "—",
    villaName: invoice.stayVillaName || invoice.villa?.name || "—",
    nights,
    checkIn: invoice.stayCheckIn
      ? formatDate(invoice.stayCheckIn)
      : invoice.booking?.checkIn
        ? formatDate(invoice.booking.checkIn)
        : "—",
    checkOut: invoice.stayCheckOut
      ? formatDate(invoice.stayCheckOut)
      : invoice.booking?.checkOut
        ? formatDate(invoice.booking.checkOut)
        : "—",
    lineItems: invoice.items.map((item, index) => ({
      id: item.id || String(index),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      amount: item.total_price,
    })),
    subtotal: invoice.subtotal,
    serviceChargeRate: invoice.serviceChargePct,
    serviceCharge: invoice.serviceCharge,
    vatRate: invoice.vatPercent,
    vat: invoice.vatAmount,
    total: invoice.totalAmount,
    currency: invoice.villa?.currency || "IDR",
    bankName: invoice.bankName || "Central Bank of Indonesia",
    accountName: invoice.bankAccountName || "Shavira Putri Pratama",
    accountNumber: invoice.bankAccountNumber || "4373126589",
    branch: invoice.bankBranch || "Bandung, Jawa Barat",
    thankYouMessage: `It was a pleasure hosting you, ${invoice.billedToName}. We look forward to welcoming you back at Numi Villa.`,
  };
}

export default async function InvoicePreviewPage({
  params,
}: InvoicePreviewPageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const invoiceData = mapInvoiceToPreviewData(invoice);

  return (
    <div className="min-h-screen bg-(--background)">
      <InvoicePreview invoiceData={invoiceData} invoiceId={id} />
    </div>
  );
}
