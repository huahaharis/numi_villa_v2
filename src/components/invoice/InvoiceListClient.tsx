"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Zap } from "lucide-react";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceTable } from "./InvoiceTable";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { InvoiceWithItems } from "@/types/database";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: "green" | "red" | "dark";
}

function StatCard({ title, value, subtitle, icon, variant }: StatCardProps) {
  const variantStyles = {
    green: {
      card: "bg-white border-(--border)",
      value: "text-(--foreground)",
      subtitle: "text-emerald-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    red: {
      card: "bg-white border-(--border)",
      value: "text-red-600",
      subtitle: "text-red-500",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    dark: {
      card: "bg-(--sidebar-bg) border-(--sidebar-bg)",
      value: "text-white",
      subtitle: "text-gray-400",
      iconBg: "bg-white/10",
      iconColor: "text-white",
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border p-6 ${style.card}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p
            className={`text-sm font-medium ${variant === "dark" ? "text-gray-400" : "text-(--text-muted)"}`}
          >
            {title}
          </p>
          <p className={`text-3xl font-bold ${style.value}`}>{value}</p>
          <p className={`text-sm font-medium ${style.subtitle}`}>{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${style.iconBg}`}>
          <span className={style.iconColor}>{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

interface InvoiceListClientProps {
  invoices: InvoiceWithItems[];
}

export function InvoiceListClient({ invoices }: InvoiceListClientProps) {
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const outstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + i.balanceDue, 0);

  const unpaidCount = invoices.filter(
    (i) => i.status !== "paid" && i.status !== "cancelled"
  ).length;

  const handleExportCSV = () => {
    const header = "Invoice ID,Date,Guest Name,Total Amount,Payment Status\n";
    const rows = invoices
      .map((invoice) => {
        return [
          invoice.invoiceNumber,
          formatDate(invoice.invoiceDate),
          invoice.billedToName,
          formatCurrency(invoice.totalAmount, invoice.villa?.currency),
          invoice.status,
        ].join(",");
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableRows = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.invoiceDate,
    guestName: invoice.billedToName,
    totalAmount: invoice.totalAmount,
    status: invoice.status,
    currency: invoice.villa?.currency,
  }));

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-(--foreground) mb-2">
          Invoice History
        </h1>
        <p className="text-(--text-muted)">
          Manage and track all villa financial transactions
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${invoices.filter((i) => i.status === "paid").length} paid invoices`}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="green"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(outstanding)}
          subtitle={`${unpaidCount} Unpaid Invoices`}
          icon={<AlertCircle className="w-6 h-6" />}
          variant="red"
        />
        <StatCard
          title="Efficiency Rate"
          value={
            invoices.length > 0
              ? `${Math.round(
                  (invoices.filter((i) => i.status === "paid").length /
                    invoices.length) *
                    100
                )}%`
              : "0%"
          }
          subtitle="Collection performance"
          icon={<Zap className="w-6 h-6" />}
          variant="dark"
        />
      </div>

      {/* Filters & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <InvoiceFilters onExportCSV={handleExportCSV} />
      </motion.div>

      {/* Invoice Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <InvoiceTable
          invoices={tableRows}
          currentPage={1}
          totalPages={1}
          totalItems={tableRows.length}
          itemsPerPage={tableRows.length || 1}
          onPageChange={() => {}}
        />
      </motion.div>
    </>
  );
}
