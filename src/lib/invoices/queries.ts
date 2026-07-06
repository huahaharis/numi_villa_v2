import { createClient as createServerClient } from "@/lib/supabase/server";
import type { InvoiceWithItems, Villa } from "@/types/database";

const invoiceSelect = `
  id,
  invoice_number,
  booking_id,
  villa_id,
  guest_id,
  invoice_date,
  due_date,
  paid_date,
  billed_to_name,
  billed_to_email,
  billed_to_phone,
  billed_to_address,
  stay_villa_name,
  stay_nights,
  stay_check_in,
  stay_check_out,
  subtotal,
  service_charge,
  service_charge_pct,
  vat_amount,
  vat_percent,
  discount_amount,
  total_amount,
  amount_paid,
  balance_due,
  payment_status,
  payment_method,
  bank_name,
  bank_account_name,
  bank_account_number,
  bank_branch,
  status,
  internal_notes,
  terms,
  created_by,
  created_at,
  updated_at,
  sent_at,
  viewed_at,
  villa:villas(id, name, slug, description, tagline, location, address, bedrooms, bathrooms, max_guests, property_type, base_rate_per_night, currency, amenities, features, cover_image, gallery_images, status, created_at, updated_at),
  items:invoice_items(id, invoice_id, service_id, description, category, quantity, unit_price, currency, total_price, tag, sort_order, created_at, updated_at)
`;

function mapSnakeToCamel<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(mapSnakeToCamel) as unknown as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    result[camelKey] =
      value && typeof value === "object" && !Array.isArray(value)
        ? mapSnakeToCamel(value as Record<string, unknown>)
        : value;
  }
  return result as T;
}

export async function getInvoices(): Promise<InvoiceWithItems[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }

  return (data ?? []).map((invoice) =>
    mapSnakeToCamel(invoice as unknown as Record<string, unknown>)
  ) as unknown as InvoiceWithItems[];
}

export async function getInvoiceById(
  id: string
): Promise<InvoiceWithItems | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `${invoiceSelect}, booking:bookings(id, booking_code, villa_id, guest_id, check_in, check_out, num_nights, adults, children, infants, total_guests, base_rate_per_night, season_adjustment, rate_multiplier, adjusted_rate, subtotal, service_fee, service_fee_percent, taxes, tax_percent, total_amount, amount_paid, balance_due, status, guest_notes, internal_notes, source, created_at, updated_at)`
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Failed to fetch invoice ${id}:`, error);
    return null;
  }

  return mapSnakeToCamel(
    data as unknown as Record<string, unknown>
  ) as unknown as InvoiceWithItems;
}

export async function getVillasForInvoice(): Promise<Villa[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("villas")
    .select(
      "id, name, slug, description, tagline, location, address, bedrooms, bathrooms, max_guests, property_type, base_rate_per_night, currency, amenities, features, cover_image, gallery_images, status, created_at, updated_at"
    )
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch villas:", error);
    return [];
  }

  return (data ?? []).map((villa) =>
    mapSnakeToCamel(villa as unknown as Record<string, unknown>)
  ) as unknown as Villa[];
}
