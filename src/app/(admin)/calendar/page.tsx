import React, { Suspense } from "react";
import { CalendarView } from "@/components/calendar/CalendarView";
import {
  getVillasForCalendar,
  getCalendarEvents,
  getChannelConnections,
} from "@/lib/calendar/queries";

export const metadata = {
  title: "Calendar & iCal Sync | Numi Villa",
  description: "Central availability calendar and OTA iCal synchronization",
};

async function CalendarContainer() {
  const villas = await getVillasForCalendar();
  const primaryVillaId = villas[0]?.id || "default";

  const [events, connections] = await Promise.all([
    getCalendarEvents(primaryVillaId),
    getChannelConnections(primaryVillaId),
  ]);

  return (
    <CalendarView
      villas={villas}
      initialEvents={events}
      connections={connections}
    />
  );
}

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-72 bg-(--border) rounded-xl" />
            <div className="h-16 w-full bg-white border border-(--border) rounded-2xl" />
            <div className="h-[500px] w-full bg-white border border-(--border) rounded-2xl" />
          </div>
        }
      >
        <CalendarContainer />
      </Suspense>
    </div>
  );
}

