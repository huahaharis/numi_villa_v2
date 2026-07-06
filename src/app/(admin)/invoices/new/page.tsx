import { Suspense } from "react";
import { GenerateInvoiceForm } from "@/components/invoice/GenerateInvoiceForm";
import { getVillasForInvoice } from "@/lib/invoices/queries";

export default async function NewInvoicePage() {
  const villas = await getVillasForInvoice();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--background) p-6 lg:p-8">
          <div className="h-8 w-48 bg-(--border) rounded animate-pulse mb-4" />
          <div className="h-4 w-96 bg-(--border) rounded animate-pulse mb-8" />
          <div className="space-y-6 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white border border-(--border) rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <GenerateInvoiceForm villas={villas} />
    </Suspense>
  );
}
