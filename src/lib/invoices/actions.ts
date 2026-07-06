"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { calculateInvoiceTotals, calculateNights } from "@/lib/utils/formatters";
import { generateInvoiceNumber } from "./utils";
import type { InvoicePayload } from "@/schemas/invoice";

export async function createInvoice(formData: InvoicePayload): Promise<string> {
  console.log("[createInvoice] payload:", JSON.stringify(formData, null, 2));
  const supabase = await createServerClient();

  // Get the selected villa for stay snapshot
  const { data: villa, error: villaError } = await supabase
    .from("villas")
    .select("name")
    .eq("id", formData.villaId)
    .single();

  if (villaError || !villa) {
    throw new Error(villaError?.message || "Selected villa not found");
  }

  // Create or upsert guest by email
  let guestId: string;
  if (formData.guestEmail) {
    const { data: existingGuest } = await supabase
      .from("guests")
      .select("id")
      .eq("email", formData.guestEmail)
      .maybeSingle();

    if (existingGuest?.id) {
      guestId = existingGuest.id;
    } else {
      const { data: newGuest, error: guestError } = await supabase
        .from("guests")
        .insert({
          full_name: formData.guestName,
          email: formData.guestEmail || null,
          phone_number: formData.guestPhone || null,
        })
        .select("id")
        .single();

      if (guestError || !newGuest) {
        throw new Error(guestError?.message || "Failed to create guest");
      }
      guestId = newGuest.id;
    }
  } else {
    const { data: newGuest, error: guestError } = await supabase
      .from("guests")
      .insert({
        full_name: formData.guestName,
        email: null,
        phone_number: formData.guestPhone || null,
      })
      .select("id")
      .single();

    if (guestError || !newGuest) {
      throw new Error(guestError?.message || "Failed to create guest");
    }
    guestId = newGuest.id;
  }

  const invoiceNumber = await generateInvoiceNumber();

  const stayNights =
    formData.stayCheckIn && formData.stayCheckOut
      ? calculateNights(formData.stayCheckIn, formData.stayCheckOut)
      : null;

  const {
    subtotal,
    serviceCharge,
    vatAmount,
    total,
  } = calculateInvoiceTotals(
    formData.lineItems,
    formData.serviceChargePercent ?? 10,
    formData.vatPercent ?? 11
  );
  console.log("[createInvoice] totals:", { subtotal, serviceCharge, vatAmount, total });

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      villa_id: formData.villaId,
      booking_id: formData.bookingId || null,
      guest_id: guestId,
      invoice_date: formData.stayCheckIn,
      due_date: formData.stayCheckOut || null,
      billed_to_name: formData.guestName,
      billed_to_email: formData.guestEmail || null,
      billed_to_phone: formData.guestPhone || null,
      billed_to_address: formData.guestAddress || null,
      stay_villa_name: villa.name,
      stay_nights: stayNights,
      stay_check_in: formData.stayCheckIn || null,
      stay_check_out: formData.stayCheckOut || null,
      subtotal,
      service_charge: serviceCharge,
      service_charge_pct: formData.serviceChargePercent ?? 10,
      vat_amount: vatAmount,
      vat_percent: formData.vatPercent ?? 11,
      total_amount: total,
      amount_paid: 0,
      balance_due: total,
      payment_status: "unpaid",
      status: "draft",
      internal_notes: formData.internalNotes || null,
    })
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    console.error("Failed to create invoice:", invoiceError);
    throw new Error(invoiceError?.message || "Failed to create invoice");
  }

  const itemsToInsert = formData.lineItems.map((item, index) => ({
    invoice_id: invoice.id,
    description: item.description,
    category: "extra",
    quantity: Number(item.quantity) || 0,
    unit_price: Number(item.unitPrice) || 0,
    total_price: Number(item.totalPrice) || 0,
    sort_order: index,
  }));
  console.log("[createInvoice] itemsToInsert:", JSON.stringify(itemsToInsert, null, 2));

  const { data: insertedItems, error: itemsError } = await supabase
    .from("invoice_items")
    .insert(itemsToInsert)
    .select("*");

  if (itemsError) {
    console.error("Failed to create invoice items:", itemsError);
    await supabase.from("invoices").delete().eq("id", invoice.id);
    throw new Error(itemsError.message || "Failed to create invoice items");
  }

  console.log("[createInvoice] inserted items:", JSON.stringify(insertedItems, null, 2));

  revalidatePath("/invoices");
  return invoice.id;
}

export async function updateInvoicePaymentStatus(
  invoiceId: string,
  paymentStatus: string,
  amountPaid?: number
): Promise<void> {
  const supabase = await createServerClient();

  const update: Record<string, unknown> = { payment_status: paymentStatus };
  if (amountPaid !== undefined) {
    update.amount_paid = amountPaid;
  }

  // Auto-calculate balance_due and status when marked paid
  if (paymentStatus === "paid") {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("total_amount")
      .eq("id", invoiceId)
      .single();
    if (invoice) {
      update.amount_paid = invoice.total_amount;
      update.balance_due = 0;
      update.status = "paid";
    }
  }

  const { error } = await supabase
    .from("invoices")
    .update(update)
    .eq("id", invoiceId);

  if (error) {
    console.error("Failed to update invoice payment status:", error);
    throw new Error(error.message || "Failed to update payment status");
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
