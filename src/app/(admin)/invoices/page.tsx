import React, { Suspense } from "react";
import { InvoiceListClient } from "@/components/invoice/InvoiceListClient";
import { getInvoices } from "@/lib/invoices/queries";

async function InvoiceList() {
  const invoices = await getInvoices();
  return <InvoiceListClient invoices={invoices} />;
}

export default function InvoiceHistoryPage() {
  return (
    <div className="min-h-screen bg-(--background) p-6 lg:p-8">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-64 bg-(--border) rounded animate-pulse mb-4" />
            <div className="h-4 w-96 bg-(--border) rounded animate-pulse mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-white border border-(--border) rounded-xl animate-pulse"
                />
              ))}
            </div>
            <div className="h-96 bg-white border border-(--border) rounded-xl animate-pulse" />
          </div>
        }
      >
        <InvoiceList />
      </Suspense>
    </div>
  );
}
