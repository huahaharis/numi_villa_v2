import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateIcalFeed, type IcalEventInput } from "@/lib/calendar/ical";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ villaSlug: string }> }
) {
  const { villaSlug } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const channel = (searchParams.get("channel") || "all").toLowerCase();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Prefer service role key for backend feeds if available to bypass RLS, fallback to anon key
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // 1. Find Villa by slug or id safely without Postgres UUID syntax errors
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(villaSlug);

  let villa: { id: string; name: string; slug: string | null } | null = null;

  try {
    if (isUuid) {
      const { data } = await supabase
        .from("villas")
        .select("id, name, slug")
        .eq("id", villaSlug)
        .maybeSingle();
      villa = data;
    }

    if (!villa) {
      const { data } = await supabase
        .from("villas")
        .select("id, name, slug")
        .eq("slug", villaSlug)
        .maybeSingle();
      villa = data;
    }

    if (!villa) {
      const { data: fallbackVilla } = await supabase
        .from("villas")
        .select("id, name, slug")
        .ilike("name", "%Numi Villa%")
        .limit(1)
        .maybeSingle();
      villa = fallbackVilla;
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

  return new NextResponse(icsText, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${villaSlug}.ics"`,
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    },
  });
}
