"use client";

import React from "react";
import type { InvoiceStatus } from "@/types/database";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "DRAFT",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  sent: {
    label: "SENT",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  paid: {
    label: "PAID",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  overdue: {
    label: "OVERDUE",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  cancelled: {
    label: "CANCELLED",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200">
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
