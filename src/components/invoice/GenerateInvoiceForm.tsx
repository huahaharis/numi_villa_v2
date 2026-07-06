"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ChevronRight, Home, FileText, Loader2 } from "lucide-react";
import { InvoiceLineItems, LineItem } from "@/components/invoice/InvoiceLineItems";
import { DatePicker } from "@/components/ui/DatePicker";
import { invoiceSchema, type InvoiceFormData, type InvoicePayload } from "@/schemas/invoice";
import { createInvoice } from "@/lib/invoices/actions";
import { calculateInvoiceTotals, formatCurrency } from "@/lib/utils/formatters";
import type { Villa } from "@/types/database";

interface GenerateInvoiceFormProps {
  villas: Villa[];
}

const initialLineItems: LineItem[] = [
  {
    id: "item-1",
    description: "Accommodation: Villa Stay",
    quantity: 1,
    unitPrice: 12500000,
    total: 12500000,
    badge: "High Season",
  },
];

export function GenerateInvoiceForm({ villas }: GenerateInvoiceFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<InvoiceFormData>({
    mode: "onBlur",
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      villaId: villas[0]?.id || "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      guestAddress: "",
      stayCheckIn: "",
      stayCheckOut: "",
      serviceChargePercent: 0,
      vatPercent: 0,
      internalNotes: "",
    },
  });

  const selectedVillaId = watch("villaId");
  const selectedVilla = villas.find((v) => v.id === selectedVillaId);
  const currency = selectedVilla?.currency || "IDR";

  // Ensure percentage fields are registered so they are included in submission.
  const serviceChargePercent = watch("serviceChargePercent");
  const vatPercent = watch("vatPercent");

  const { subtotal, serviceCharge, vatAmount, total } = useMemo(() => {
    const items = lineItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));
    return calculateInvoiceTotals(
      items,
      serviceChargePercent ?? 0,
      vatPercent ?? 0
    );
  }, [lineItems, serviceChargePercent, vatPercent]);

  const onSubmit = async (data: InvoiceFormData) => {
    console.log("[InvoiceForm] onSubmit called", data);
    if (lineItems.length === 0) {
      setServerError("Add at least one line item.");
      return;
    }

    setSubmitting(true);
    setServerError(null);

    const payload: InvoicePayload = {
      ...data,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total,
      })),
    };
    console.log("[InvoiceForm] payload:", payload);

    try {
      const invoiceId = await createInvoice(payload);
      console.log("[InvoiceForm] created invoice id:", invoiceId);
      router.push(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error("[InvoiceForm] createInvoice error:", error);
      setServerError(
        error instanceof Error ? error.message : "Failed to create invoice"
      );
      setSubmitting(false);
    }
  };

  const onError = (formErrors: typeof errors) => {
    console.error("[InvoiceForm] validation errors:", formErrors);
    const messages = Object.entries(formErrors)
      .map(([key, err]) => err?.message || `${key} is invalid`)
      .filter(Boolean);
    setServerError(messages.join(" • ") || "Please fix the form errors.");
  };

  return (
    <div className="min-h-screen bg-(--background) p-6 lg:p-8">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm mb-8"
      >
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
        <span className="font-medium text-(--foreground)">New Invoice</span>
      </motion.nav>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 mx-auto max-w-5xl"
      >
        <h1 className="text-3xl font-bold text-(--foreground) mb-2">
          Generate Invoice
        </h1>
        <p className="text-(--text-muted)">
          Create a new invoice for villa accommodation and services
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 max-w-5xl mx-auto">
        {/* Selected Villa Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-(--border) rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-(--foreground) mb-4">
            Selected Villa
          </h2>
          {villas.length === 0 ? (
            <p className="text-sm text-red-600">
              No active villas found. Please create a villa first.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {villas.map((villa) => (
                <label
                  key={villa.id}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedVillaId === villa.id
                      ? "border-(--accent) bg-(--background)"
                      : "border-(--border) hover:border-(--accent)/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={villa.id}
                    {...register("villaId")}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-(--background) rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-(--accent)" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-(--foreground)">
                        {villa.name}
                      </p>
                      <p className="text-xs text-(--text-muted) mt-0.5">
                        {villa.location || "—"}
                      </p>
                      <p className="text-xs font-medium text-(--accent) mt-2">
                        {formatCurrency(villa.baseRatePerNight, villa.currency)}/night
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
          {errors.villaId && (
            <p className="mt-2 text-sm text-red-600">{errors.villaId.message}</p>
          )}
        </motion.section>

        {/* Stay Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="bg-white border border-(--border) rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-(--foreground) mb-4">
            Stay Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Controller
                name="stayCheckIn"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Check-in"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select check-in date"
                  />
                )}
              />
              {errors.stayCheckIn && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stayCheckIn.message}
                </p>
              )}
            </div>
            <div>
              <Controller
                name="stayCheckOut"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Check-out"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select check-out date"
                  />
                )}
              />
              {errors.stayCheckOut && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stayCheckOut.message}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* Guest Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white border border-(--border) rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-(--foreground) mb-4">
            Guest Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-(--foreground) mb-2">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Jonathan Aris"
                {...register("guestName")}
                className="w-full px-4 py-2.5 text-sm bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent"
              />
              {errors.guestName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.guestName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-(--foreground) mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="guest@example.com"
                {...register("guestEmail")}
                className="w-full px-4 py-2.5 text-sm bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent"
              />
              {errors.guestEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.guestEmail.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-(--foreground) mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+62 812 3456 7890"
                {...register("guestPhone")}
                className="w-full px-4 py-2.5 text-sm bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-(--foreground) mb-2">
                Address
              </label>
              <input
                type="text"
                placeholder="Guest address"
                {...register("guestAddress")}
                className="w-full px-4 py-2.5 text-sm bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--text-muted) mb-2">
                Currency
              </label>
              <div className="px-4 py-2.5 bg-(--background) border border-(--border) rounded-lg">
                <span className="text-sm text-(--foreground)">
                  {currency}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Services & Extras */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <InvoiceLineItems
            items={lineItems}
            onChange={setLineItems}
            currency={currency}
          />
        </motion.section>

        {/* Totals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-end"
        >
          <div className="w-full max-w-sm bg-white border border-(--border) rounded-xl p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--text-muted)">Subtotal</span>
                <span className="font-medium text-(--foreground)">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--text-muted)">
                  Service Charge ({serviceChargePercent ?? 10}%)
                </span>
                <span className="font-medium text-(--foreground)">
                  {formatCurrency(serviceCharge, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--text-muted)">VAT ({vatPercent ?? 11}%)</span>
                <span className="font-medium text-(--foreground)">
                  {formatCurrency(vatAmount, currency)}
                </span>
              </div>
              <div className="border-t border-(--border) pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-(--foreground)">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-(--foreground)">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Additional Notes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-white border border-(--border) rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-(--foreground) mb-4">
            Additional Notes
          </h2>
          <textarea
            {...register("internalNotes")}
            placeholder="Add any internal notes or special instructions..."
            rows={4}
            className="w-full px-4 py-3 text-sm bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent resize-none"
          />
        </motion.section>

        {/* Server Error */}
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center justify-end gap-4 pb-8"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/invoices")}
            className="px-6 py-3 text-sm font-medium text-(--foreground) bg-white border border-(--border) rounded-lg hover:bg-(--background) transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: submitting || villas.length === 0 ? 1 : 1.02 }}
            whileTap={{ scale: submitting || villas.length === 0 ? 1 : 0.98 }}
            disabled={submitting || villas.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-(--foreground) rounded-lg hover:bg-(--sidebar-bg) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Preview Invoice"
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
