"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { parseIcalFeed } from "./ical";

export interface CreateBlockInput {
  villaId: string;
  startDate: string;
  endDate: string;
  reason: string;
  targetChannels: string[];
}

export async function createCalendarBlock(input: CreateBlockInput): Promise<string> {
  const supabase = await createServerClient();

  if (new Date(input.endDate) <= new Date(input.startDate)) {
    throw new Error("End date must be after start date");
  }

  const { data, error } = await supabase
    .from("calendar_blocks")
    .insert({
      villa_id: input.villaId,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason || "Blocked",
      target_channels: input.targetChannels && input.targetChannels.length > 0
        ? input.targetChannels
        : ["all"],
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create calendar block:", error);
    throw new Error(error.message || "Failed to block dates");
  }

  revalidatePath("/calendar");
  return data.id;
}

export async function deleteCalendarBlock(blockId: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("calendar_blocks")
    .delete()
    .eq("id", blockId);

  if (error) {
    console.error("Failed to delete calendar block:", error);
    throw new Error(error.message || "Failed to remove block");
  }

  revalidatePath("/calendar");
}

export async function saveChannelConnection(input: {
  villaId: string;
  channelName: string;
  inboundUrl: string;
}): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("channel_connections")
    .upsert(
      {
        villa_id: input.villaId,
        channel_name: input.channelName,
        inbound_url: input.inboundUrl.trim() || null,
        is_active: true,
      },
      { onConflict: "villa_id,channel_name" }
    );

  if (error) {
    console.error("Failed to save channel connection:", error);
    throw new Error(error.message || "Failed to save channel settings");
  }

  revalidatePath("/calendar");
}

export async function syncChannelFeeds(villaId: string): Promise<{
  success: boolean;
  syncedCount: number;
  channels: { name: string; status: "success" | "error"; error?: string }[];
}> {
  const supabase = await createServerClient();

  const { data: connections, error } = await supabase
    .from("channel_connections")
    .select("*")
    .eq("villa_id", villaId)
    .eq("is_active", true);

  if (error || !connections || connections.length === 0) {
    return { success: true, syncedCount: 0, channels: [] };
  }

  const results: { name: string; status: "success" | "error"; error?: string }[] = [];
  let totalImported = 0;

  for (const conn of connections) {
    if (!conn.inbound_url || !conn.inbound_url.startsWith("http")) {
      continue;
    }

    try {
      // 1. Fetch remote iCal
      const response = await fetch(conn.inbound_url, {
        headers: { "User-Agent": "NumiVillaCalendarSync/1.0" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch calendar`);
      }

      const icsText = await response.text();
      const events = parseIcalFeed(icsText);

      // 2. Upsert guest if needed or create booking records
      // For each event, we check if booking exists with this booking_code
      for (const ev of events) {
        const bookingCode = `OTA-${conn.channel_name.toUpperCase().slice(0, 3)}-${ev.uid.slice(-8)}`;

        const { data: existing } = await supabase
          .from("bookings")
          .select("id")
          .eq("booking_code", bookingCode)
          .maybeSingle();

        if (!existing) {
          // Create minimal booking placeholder
          // Need guest_id - find or create OTA Guest
          let otaGuestId: string | null = null;
          const { data: otaGuest } = await supabase
            .from("guests")
            .select("id")
            .eq("email", `guest+${conn.channel_name}@numivilla.my.id`)
            .maybeSingle();

          if (otaGuest?.id) {
            otaGuestId = otaGuest.id;
          } else {
            const { data: newGuest } = await supabase
              .from("guests")
              .insert({
                full_name: `${conn.channel_name.toUpperCase()} Guest`,
                email: `guest+${conn.channel_name}@numivilla.my.id`,
              })
              .select("id")
              .maybeSingle();
            otaGuestId = newGuest?.id || null;
          }

          if (otaGuestId) {
            const startD = new Date(ev.startDate);
            const endD = new Date(ev.endDate);
            const nights = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));

            await supabase.from("bookings").insert({
              booking_code: bookingCode,
              villa_id: villaId,
              guest_id: otaGuestId,
              check_in: ev.startDate,
              check_out: ev.endDate,
              num_nights: nights,
              adults: 1,
              total_guests: 1,
              base_rate_per_night: 0,
              adjusted_rate: 0,
              subtotal: 0,
              total_amount: 0,
              status: "confirmed",
              source: conn.channel_name,
              guest_notes: ev.summary || `${conn.channel_name} Booking`,
            });
            totalImported++;
          }
        }
      }

      // 3. Mark channel as synced
      await supabase
        .from("channel_connections")
        .update({
          last_synced_at: new Date().toISOString(),
          sync_status: "success",
          sync_error: null,
        })
        .eq("id", conn.id);

      results.push({ name: conn.channel_name, status: "success" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Sync failed";
      console.error(`Sync error for ${conn.channel_name}:`, err);
      await supabase
        .from("channel_connections")
        .update({
          last_synced_at: new Date().toISOString(),
          sync_status: "error",
          sync_error: errMsg,
        })
        .eq("id", conn.id);

      results.push({
        name: conn.channel_name,
        status: "error",
        error: errMsg,
      });
    }
  }

  revalidatePath("/calendar");
  return { success: true, syncedCount: totalImported, channels: results };
}

