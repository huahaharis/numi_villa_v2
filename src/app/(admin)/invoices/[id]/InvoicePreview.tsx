"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Home, FileText, Check } from "lucide-react";
import { InvoiceExportButtons } from "@/components/invoice/InvoiceExportButtons";
import { formatCurrency } from "@/lib/utils/formatters";
import { updateInvoicePaymentStatus } from "@/lib/invoices/actions";
import type { InvoiceData } from "@/data/invoiceData";

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  invoiceId: string;
}

export function InvoicePreview({ invoiceData, invoiceId }: InvoicePreviewProps) {
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    { type: "success"; message: string } | { type: "error"; message: string } | null
  >(null);
  const [paymentStatus, setPaymentStatus] = useState(invoiceData.paymentStatus);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSendEmail = async () => {
    if (!invoiceData.guestEmail || invoiceData.guestEmail === "—") return;
    setSending(true);
    setSendStatus(null);
    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: invoiceData.guestEmail,
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceData,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSendStatus({ type: "success", message: "Invoice sent successfully." });
      } else {
        setSendStatus({
          type: "error",
          message: data.error?.message || data.error || "Failed to send invoice.",
        });
      }
    } catch (error) {
      console.error("Failed to send invoice:", error);
      setSendStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send invoice.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Top Bar - hidden when printing */}
      <div className="print:hidden">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm px-6 lg:px-8 pt-6 pb-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 text-(--text-muted) hover:text-(--foreground) transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4 text-(--text-muted)" />
          <button
            onClick={() => router.push("/invoices")}
            className="text-(--text-muted) hover:text-(--foreground) transition-colors"
          >
            Invoices
          </button>
          <ChevronRight className="w-4 h-4 text-(--text-muted)" />
          <span className="font-medium text-(--foreground)">
            {invoiceData.invoiceNumber}
          </span>
        </nav>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {invoiceData.status}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="text-sm px-3 py-1.5 bg-white border border-(--border) rounded-lg text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
                <option value="refunded">Refunded</option>
              </select>
              {paymentStatus !== invoiceData.paymentStatus && (
                <button
                  onClick={() => {
                    setPaymentMessage(null);
                    startTransition(async () => {
                      try {
                        await updateInvoicePaymentStatus(invoiceId, paymentStatus);
                        setPaymentMessage("Payment status updated.");
                      } catch (error) {
                        setPaymentMessage(
                          error instanceof Error
                            ? error.message
                            : "Failed to update payment status."
                        );
                      }
                    });
                  }}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-(--foreground) rounded-lg hover:bg-(--sidebar-bg) transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save
                </button>
              )}
            </div>
          </div>
          <InvoiceExportButtons
            invoiceId={invoiceId}
            invoiceData={invoiceData}
            invoiceRef={invoiceRef}
            guestEmail={
              invoiceData.guestEmail === "—" ? undefined : invoiceData.guestEmail
            }
            onSendEmail={handleSendEmail}
          />
        </div>
        {paymentMessage && (
          <div
            className={`mx-6 lg:mx-8 mb-2 px-4 py-2 rounded-lg text-sm ${
              paymentMessage.includes("updated")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {paymentMessage}
          </div>
        )}
        {sendStatus && (
          <div
            className={`mx-6 lg:mx-8 mb-4 px-4 py-3 rounded-lg text-sm ${
              sendStatus.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {sendStatus.message}
          </div>
        )}
      </div>

      {/* Invoice Content - A4 sized */}
      <div className="invoice-a4">
        <div
          ref={invoiceRef}
          className="max-w-[210mm] mx-auto bg-white shadow-sm print:shadow-none"
        >
          <div className="p-10 lg:p-12">
            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
              {/* Left - Branding */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-(--foreground) rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-2xl font-bold tracking-tight text-(--foreground)"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      NUMI VILLA
                    </h1>
                    <p className="text-xs text-(--text-muted) tracking-widest uppercase">
                      Luxury Residences &amp; Estates
                    </p>
                  </div>
                </div>
                <div className="pt-3 text-sm text-(--text-muted) leading-relaxed">
                      <p>Cluster kaliandra no A-105, Pangandaran, Jawa Barat</p>
                  <p>081221882454</p>
                  <p>www.numivilla.my.id</p>
                </div>
              </div>

              {/* Right - Invoice Info */}
              <div className="text-right space-y-1">
                <h2
                  className="text-4xl font-bold text-(--foreground) tracking-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  INVOICE
                </h2>
                <div className="pt-3 space-y-1 text-sm">
                  <div className="flex justify-end gap-6">
                    <span className="text-(--text-muted)">Invoice #</span>
                    <span className="font-medium text-(--foreground)">
                      {invoiceData.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex justify-end gap-6">
                    <span className="text-(--text-muted)">Date</span>
                    <span className="font-medium text-(--foreground)">
                      {invoiceData.date}
                    </span>
                  </div>
                  <div className="flex justify-end gap-6">
                    <span className="text-(--text-muted)">Due</span>
                    <span className="font-medium text-(--foreground)">
                      {invoiceData.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="border-t-2 border-(--foreground) mb-10" />

            {/* Billed To & Stay Details */}
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
              {/* Billed To */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-(--text-muted) uppercase tracking-widest">
                  Billed To
                </h3>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-(--foreground)">
                    {invoiceData.guestName}
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    {invoiceData.guestEmail}
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    {invoiceData.guestPhone}
                  </p>
                  {invoiceData.guestAddress && invoiceData.guestAddress !== "—" && (
                    <p className="text-sm text-(--text-muted)">
                      {invoiceData.guestAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Stay Details */}
              <div className="space-y-3 md:text-right">
                <h3 className="text-xs font-semibold text-(--text-muted) uppercase tracking-widest">
                  Stay Details
                </h3>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-(--foreground)">
                    {invoiceData.villaName} ({invoiceData.nights} Nights)
                  </p>
                  <div className="flex md:justify-end gap-6 text-sm">
                    <span className="text-(--text-muted)">Check-in</span>
                    <span className="font-medium text-(--foreground)">
                      {invoiceData.checkIn}
                    </span>
                  </div>
                  <div className="flex md:justify-end gap-6 text-sm">
                    <span className="text-(--text-muted)">Check-out</span>
                    <span className="font-medium text-(--foreground)">
                      {invoiceData.checkOut}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="mb-10">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-(--foreground)">
                    <th className="text-left py-3 text-xs font-semibold text-(--foreground) uppercase tracking-wider">
                      Service Description
                    </th>
                    <th className="text-center py-3 text-xs font-semibold text-(--foreground) uppercase tracking-wider w-16">
                      Qty
                    </th>
                    <th className="text-right py-3 text-xs font-semibold text-(--foreground) uppercase tracking-wider w-32">
                      Unit Price
                    </th>
                    <th className="text-right py-3 text-xs font-semibold text-(--foreground) uppercase tracking-wider w-32">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {invoiceData.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4">
                        <p className="text-sm font-medium text-(--foreground)">
                          {item.description}
                        </p>
                        {item.detail && (
                          <p className="text-xs text-(--text-muted) mt-0.5">
                            {item.detail}
                          </p>
                        )}
                      </td>
                      <td className="py-4 text-center text-sm text-(--foreground)">
                        {item.quantity}
                      </td>
                      <td className="py-4 text-right text-sm text-(--foreground)">
                        {formatCurrency(item.unitPrice, invoiceData.currency)}
                      </td>
                      <td className="py-4 text-right text-sm font-medium text-(--foreground)">
                        {formatCurrency(item.amount, invoiceData.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-10">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-(--text-muted)">Subtotal</span>
                  <span className="text-(--foreground)">
                    {formatCurrency(invoiceData.subtotal, invoiceData.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--text-muted)">
                    Service Charge ({invoiceData.serviceChargeRate}%)
                  </span>
                  <span className="text-(--foreground)">
                    {formatCurrency(invoiceData.serviceCharge, invoiceData.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--text-muted)">
                    VAT ({invoiceData.vatRate}%)
                  </span>
                  <span className="text-(--foreground)">
                    {formatCurrency(invoiceData.vat, invoiceData.currency)}
                  </span>
                </div>
                <div className="border-t-2 border-(--foreground) pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-(--foreground)">
                      Total
                    </span>
                    <span className="text-3xl font-bold text-(--foreground)">
                      {formatCurrency(invoiceData.total, invoiceData.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-10">
              <h3 className="text-xs font-semibold text-(--text-muted) uppercase tracking-widest mb-4">
                Payment Methods
              </h3>
              <div className="bg-(--background) border border-(--border) rounded-lg p-6 space-y-2">
                <p className="text-sm font-semibold text-(--foreground)">
                  Bank Transfer
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-(--text-muted)">Bank: </span>
                    <span className="text-(--foreground)">
                      {invoiceData.bankName}
                    </span>
                  </div>
                  <div>
                    <span className="text-(--text-muted)">
                      Account Name:{" "}
                    </span>
                    <span className="text-(--foreground)">
                      {invoiceData.accountName}
                    </span>
                  </div>
                  <div>
                    <span className="text-(--text-muted)">
                      Account Number:{" "}
                    </span>
                    <span className="text-(--foreground)">
                      {invoiceData.accountNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-(--text-muted)">Branch: </span>
                    <span className="text-(--foreground)">
                      {invoiceData.branch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mb-10">
              <div className="border-l-4 border-(--accent) bg-(--accent)/5 rounded-r-lg p-6">
                <p
                  className="text-base text-(--foreground) italic leading-relaxed"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  &ldquo;{invoiceData.thankYouMessage}&rdquo;
                </p>
                <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-widest mt-4">
                  — Management Team
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-(--border) pt-6 text-center">
              <p className="text-xs text-(--text-muted)">
                Numi Villa &middot; Cluster kaliandra no A-105 &middot; Pangandaran,
                Jawa Barat &middot; www.numivilla.my.id
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            background: white;
          }

          .invoice-a4 {
            padding: 0;
          }

          .invoice-a4 > div {
            box-shadow: none;
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
