"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { InvoiceStatus } from "@/types/database";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  guestName: string;
  totalAmount: number;
  status: InvoiceStatus;
  currency?: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

export function InvoiceTable({
  invoices,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange,
  onView,
  onDownload,
}: InvoiceTableProps) {
  const router = useRouter();

  const handleView = (invoice: Invoice) => {
    if (onView) {
      onView(invoice);
    } else {
      router.push(`/invoices/${invoice.id}`);
    }
  };

  const handleDownload = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(invoice);
    } else {
      console.log(`Downloading invoice ${invoice.invoiceNumber}`);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white border border-(--border) rounded-xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--border) bg-(--background)">
              <th className="text-left px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                Guest Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                Total Amount
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                Payment Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                onClick={() => handleView(invoice)}
                className="hover:bg-(--background) transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-sm font-medium text-(--foreground)">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-sm text-(--text-muted)">
                  {formatDate(invoice.date)}
                </td>
                <td className="px-6 py-4 text-sm text-(--foreground)">
                  {invoice.guestName}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-(--foreground)">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </td>
                <td className="px-6 py-4">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(invoice);
                      }}
                      className="p-2 text-(--text-muted) hover:text-(--foreground) hover:bg-(--background) rounded-lg transition-colors"
                      title="View invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, invoice)}
                      className="p-2 text-(--text-muted) hover:text-(--foreground) hover:bg-(--background) rounded-lg transition-colors"
                      title="Download invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-(--text-muted)"
                >
                  No invoices found. Create your first invoice to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-(--border)">
          <p className="text-sm text-(--text-muted)">
            Showing{" "}
            <span className="font-medium text-(--foreground)">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="font-medium text-(--foreground)">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="font-medium text-(--foreground)">
              {totalItems}
            </span>{" "}
            invoices
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 text-(--text-muted) hover:text-(--foreground) hover:bg-(--background) rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .reduce<(number | string)[]>(
                (acc, page, i, arr) => {
                  if (i > 0 && (arr[i - 1] as number) !== page - 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                },
                []
              )
              .map((page, i) =>
                typeof page === "string" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-3 py-2 text-sm text-(--text-muted)"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? "bg-(--foreground) text-white"
                        : "text-(--foreground) hover:bg-(--background)"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 text-(--text-muted) hover:text-(--foreground) hover:bg-(--background) rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
