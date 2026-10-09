import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Villa, CalendarEvent, ChannelConnection } from "@/types/database";

const DEFAULT_CHANNELS = ["airbnb", "agoda", "booking_com", "tiket_com"];

export async function getVillasForCalendar(): Promise<Villa[]> {
  const supabase = await createServerClient();

  // Prefer Numi Villa Pangandaran
  let { data, error } = await supabase
    .from("villas")
    .select("id, name, slug, location, status, currency, base_rate_per_night")
    .ilike("name", "%Numi Villa%")
    .order("name", { ascending: true });

  if (!data || data.length === 0) {
    const res = await supabase
      .from("villas")
      .select("id, name, slug, location, status, currency, base_rate_per_night")
      .order("name", { ascending: true })
      .limit(1);
    data = res.data;
    error = res.error;
  }

  if (error || !data || data.length === 0) {
    // Return sample/mock fallback if DB table is empty or error
    return [
      {
        id: "v1-numi-pangandaran",
        name: "Numi Villa Pangandaran",
        slug: "numi-villa-pangandaran",
        description: "Beachfront luxury villa",
        tagline: null,
        location: "Pangandaran, West Java",
        address: null,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        propertyType: "villa",
        baseRatePerNight: 1000000,
        currency: "IDR",
        amenities: [],
        features: [],
        coverImage: "/properties/main-villa.png",
        galleryImages: [],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  return data.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    description: null,
    tagline: null,
    location: v.location,
    address: null,
    bedrooms: 0,
    bathrooms: 0,
    maxGuests: 0,
    propertyType: "villa",
    baseRatePerNight: Number(v.base_rate_per_night) || 0,
    currency: v.currency || "IDR",
    amenities: [],
    features: [],
    coverImage: null,
    galleryImages: [],
    status: v.status || "active",
    createdAt: "",
    updatedAt: "",
  }));
}

export async function getCalendarEvents(villaId?: string): Promise<CalendarEvent[]> {
  const supabase = await createServerClient();
  const events: CalendarEvent[] = [];

  // 1. Fetch bookings
  try {
    let bookingsQuery = supabase
      .from("bookings")
      .select("id, booking_code, villa_id, check_in, check_out, status, total_amount, source, guest_notes, guests(full_name)")
      .neq("status", "cancelled");

    if (villaId && villaId !== "all") {
      bookingsQuery = bookingsQuery.eq("villa_id", villaId);
    }

    const { data: bookingsData } = await bookingsQuery;

    if (bookingsData && bookingsData.length > 0) {
      for (const b of bookingsData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const guestName = (b.guests as any)?.full_name || "Guest";
        const sourceVal = b.source?.toLowerCase() || "direct";
        let resolvedSource: CalendarEvent["source"] = "direct";
        if (sourceVal.includes("airbnb")) resolvedSource = "airbnb";
        else if (sourceVal.includes("agoda")) resolvedSource = "agoda";
        else if (sourceVal.includes("booking")) resolvedSource = "booking_com";
        else if (sourceVal.includes("tiket")) resolvedSource = "tiket_com";

        events.push({
          id: `booking-${b.id}`,
          rawId: b.id,
          type: "booking",
          title: `${guestName} (${b.booking_code})`,
          startDate: b.check_in,
          endDate: b.check_out,
          source: resolvedSource,
          guestName,
          bookingCode: b.booking_code,
          status: b.status,
          totalAmount: b.total_amount,
        });
      }
    }
  } catch (err) {
    console.warn("Could not query bookings table for calendar:", err);
  }

  // 2. Fetch custom calendar blocks
  try {
    let blocksQuery = supabase
      .from("calendar_blocks")
      .select("id, villa_id, start_date, end_date, reason, target_channels");

    if (villaId && villaId !== "all") {
      blocksQuery = blocksQuery.eq("villa_id", villaId);
    }

    const { data: blocksData } = await blocksQuery;

    if (blocksData && blocksData.length > 0) {
      for (const block of blocksData) {
        events.push({
          id: `block-${block.id}`,
          rawId: block.id,
          type: "block",
          title: block.reason || "Blocked Dates",
          startDate: block.start_date,
          endDate: block.end_date,
          source: "block",
          targetChannels: block.target_channels || ["all"],
          reason: block.reason,
        });
      }
    }
  } catch (err) {
    console.warn("Could not query calendar_blocks table:", err);
  }

  return events;
}

export async function getChannelConnections(villaId: string): Promise<ChannelConnection[]> {
  const supabase = await createServerClient();

  try {
    const { data } = await supabase
      .from("channel_connections")
      .select("*")
      .eq("villa_id", villaId);

    const existingMap = new Map((data || []).map((item) => [item.channel_name, item]));

    return DEFAULT_CHANNELS.map((channel) => {
      const existing = existingMap.get(channel);
      return {
        id: existing?.id || `conn-${channel}`,
        villaId,
        channelName: channel,
        inboundUrl: existing?.inbound_url || null,
        isActive: existing?.is_active ?? true,
        lastSyncedAt: existing?.last_synced_at || null,
        syncStatus: existing?.sync_status || "idle",
        syncError: existing?.sync_error || null,
        createdAt: existing?.created_at || "",
        updatedAt: existing?.updated_at || "",
      };
    });
  } catch {
    return DEFAULT_CHANNELS.map((channel) => ({
      id: `conn-${channel}`,
      villaId,
      channelName: channel,
      inboundUrl: null,
      isActive: true,
      lastSyncedAt: null,
      syncStatus: "idle",
      syncError: null,
      createdAt: "",
      updatedAt: "",
    }));
  }
}

