import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateIcalFeed, type IcalEventInput } from "@/lib/calendar/ical";

const KNOWN_CHANNELS = new Set([
  "airbnb",
  "agoda",
  "booking_com",
  "booking.com",
  "booking",
  "tiket_com",
  "tiket.com",
  "tiket",
  "direct",
  "all",
]);

function normalizeChannel(raw: string): string {
  const clean = raw.replace(/\.ics$/i, "").toLowerCase();
  if (clean === "booking" || clean === "booking.com") return "booking_com";
  if (clean === "tiket" || clean === "tiket.com") return "tiket_com";
  return clean;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params;
  const searchParams = request.nextUrl.searchParams;

  let villaIdentifier = "";
  let channel = (searchParams.get("channel") || "all").toLowerCase();

  if (slug.length === 1) {
    const singleSegment = slug[0];
    const stripped = singleSegment.replace(/\.ics$/i, "").toLowerCase();

    // If URL is /api/ical/agoda.ics or /api/ical/airbnb.ics, the segment is the channel
    if (KNOWN_CHANNELS.has(stripped)) {
      channel = normalizeChannel(stripped);
      villaIdentifier = ""; // Will fallback to default villa
    } else {
      villaIdentifier = singleSegment.replace(/\.ics$/i, "");
    }
  } else if (slug.length >= 2) {
    // Format: /api/ical/numi-villa-pangandaran/agoda.ics
    villaIdentifier = slug[0].replace(/\.ics$/i, "");
    channel = normalizeChannel(slug[1]);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Prefer service role key for backend feeds if available to bypass RLS, fallback to anon key
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // 1. Find Villa by slug or id safely without Postgres UUID syntax errors
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(villaIdentifier);

  let villa: { id: string; name: string; slug: string | null } | null = null;

  try {
    if (villaIdentifier && isUuid) {
      const { data } = await supabase
        .from("villas")
        .select("id, name, slug")
        .eq("id", villaIdentifier)
        .maybeSingle();
      villa = data;
    }

    if (!villa && villaIdentifier) {
      const { data } = await supabase
        .from("villas")
        .select("id, name, slug")
        .eq("slug", villaIdentifier)
        .maybeSingle();
      villa = data;
    }

    // Fallback to default active villa (Numi Villa Pangandaran)
    if (!villa) {
      const { data: fallbackVilla } = await supabase
        .from("villas")
        .select("id, name, slug")
        .ilike("name", "%Numi Villa%")
        .limit(1)
        .maybeSingle();
      villa = fallbackVilla;
    }

    // Final fallback to any single villa in table
    if (!villa) {
      const { data: anyVilla } = await supabase
        .from("villas")
        .select("id, name, slug")
        .limit(1)
        .maybeSingle();
      villa = anyVilla;
    }
  } catch (err) {
    console.error("Error looking up villa for iCal:", err);
  }

  const villaId = villa?.id;
  const villaName = villa?.name || "Numi Villa Pangandaran";

  const events: IcalEventInput[] = [];

  // 2. Fetch Active Bookings (if villa found or by villaId)
  if (villaId) {
    try {
      const { data: bookings, error: bookingsErr } = await supabase
        .from("bookings")
        .select("id, booking_code, check_in, check_out, source, status")
        .eq("villa_id", villaId)
        .neq("status", "cancelled");

      if (bookingsErr) {
        console.warn("Bookings query warning for iCal:", bookingsErr.message);
      } else if (bookings) {
        for (const b of bookings) {
          events.push({
            uid: `booking-${b.id}@numivilla.my.id`,
            startDate: b.check_in,
            endDate: b.check_out,
            summary: `Reserved (${b.source?.toUpperCase() || "DIRECT"})`,
            description: `Booking Code: ${b.booking_code}`,
            status: "CONFIRMED",
          });
        }
      }
    } catch (err) {
      console.error("Failed to query bookings for iCal feed:", err);
    }

    // 3. Fetch Calendar Blocks (filtered by target channel!)
    try {
      const { data: blocks, error: blocksErr } = await supabase
        .from("calendar_blocks")
        .select("id, start_date, end_date, reason, target_channels")
        .eq("villa_id", villaId);

      if (blocksErr) {
        console.warn("Calendar blocks query warning for iCal:", blocksErr.message);
      } else if (blocks) {
        for (const block of blocks) {
          const targets: string[] = block.target_channels || ["all"];
          const appliesToChannel =
            channel === "all" ||
            targets.includes("all") ||
            targets.includes(channel);

          if (appliesToChannel) {
            events.push({
              uid: `block-${block.id}@numivilla.my.id`,
              startDate: block.start_date,
              endDate: block.end_date,
              summary: `Blocked - ${block.reason || "Not Available"}`,
              description: `Channel restriction for: ${targets.join(", ")}`,
              status: "CONFIRMED",
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to query calendar blocks for iCal feed:", err);
    }
  }

  // 4. Generate RFC 5545 iCalendar content
  const icsText = generateIcalFeed({
    villaName,
    events,
  });

  const downloadFilename = channel && channel !== "all"
    ? `${villa?.slug || "numi-villa"}-${channel}.ics`
    : `${villa?.slug || "numi-villa"}.ics`;

  return new NextResponse(icsText, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${downloadFilename}"`,
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    },
  });
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const getResponse = await GET(request, context);
  return new NextResponse(null, {
    status: getResponse.status,
    headers: getResponse.headers,
  });
}
