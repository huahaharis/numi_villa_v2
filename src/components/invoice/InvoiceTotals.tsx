"use client";

import React from "react";

export interface TotalsData {
  subtotal: number;
  serviceChargeRate: number;
  serviceCharge: number;
  vatRate: number;
  vat: number;
  total: number;
  currency?: string;
}

interface InvoiceTotalsProps {
  totals: TotalsData;
}

export function InvoiceTotals({ totals }: InvoiceTotalsProps) {
  const currency = totals.currency || "$";

  const formatAmount = (amount: number) => {
    return `${currency}${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="w-full max-w-sm ml-auto">
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-(--text-muted)">Subtotal</span>
          <span className="font-medium text-(--foreground)">
            {formatAmount(totals.subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-(--text-muted)">
            Service Charge ({totals.serviceChargeRate}%)
          </span>
          <span className="font-medium text-(--foreground)">
            {formatAmount(totals.serviceCharge)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-(--text-muted)">
            VAT ({totals.vatRate}%)
          </span>
          <span className="font-medium text-(--foreground)">
            {formatAmount(totals.vat)}
          </span>
        </div>

        <div className="border-t border-(--border) pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-(--foreground)">
              Total
            </span>
            <span className="text-2xl font-bold text-(--foreground)">
              {formatAmount(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
