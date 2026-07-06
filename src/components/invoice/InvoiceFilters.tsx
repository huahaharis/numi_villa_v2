"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Plus, Search, SlidersHorizontal } from "lucide-react";

interface InvoiceFiltersProps {
  onExportCSV?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
}

export function InvoiceFilters({
  onExportCSV,
  onSearch,
  onFilter,
}: InvoiceFiltersProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }

    // Default CSV export behavior
    const csvContent =
      "Invoice ID,Date,Guest Name,Total Amount,Payment Status\n" +
      "INV-2024-001,2024-01-15,John Doe,IDR 1.250.000,PAID\n" +
      "INV-2024-002,2024-01-18,Jane Smith,IDR 890.000,UNPAID\n";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-(--border) rounded-lg text-(--foreground) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onFilter}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-(--foreground) bg-white border border-(--border) rounded-lg hover:bg-(--background) transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-(--foreground) bg-white border border-(--border) rounded-lg hover:bg-(--background) transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/invoices/new")}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-(--foreground) rounded-lg hover:bg-(--sidebar-bg) transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </motion.button>
      </div>
    </div>
  );
}
