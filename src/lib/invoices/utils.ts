import { createClient as createServerClient } from "@/lib/supabase/server";

export async function generateInvoiceNumber(): Promise<string> {
  const supabase = await createServerClient();
  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .ilike("invoice_number", `INV-${year}-%`)
    .order("invoice_number", { ascending: false })
    .limit(1)
    .single();

  let nextSeq = 1;
  if (data?.invoice_number) {
    const match = data.invoice_number.match(/-([\d]+)$/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  const padded = String(nextSeq).padStart(4, "0");
  return `INV-${year}-${padded}`;
}
