"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  Lock,
  Filter,
} from "lucide-react";
import { BlockDatesModal } from "./BlockDatesModal";
import { EventDetailModal } from "./EventDetailModal";
import { ChannelSyncDrawer } from "./ChannelSyncDrawer";
import type { Villa, CalendarEvent, ChannelConnection } from "@/types/database";

interface CalendarViewProps {
  villas: Villa[];
  initialEvents: CalendarEvent[];
  connections: ChannelConnection[];
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CHANNEL_FILTERS = [
  { id: "all", label: "All Events", color: "#6b7280" },
  { id: "direct", label: "Direct", color: "#b07d62" },
  { id: "airbnb", label: "Airbnb", color: "#ff385c" },
  { id: "agoda", label: "Agoda", color: "#00a651" },
  { id: "booking_com", label: "Booking.com", color: "#003580" },
  { id: "tiket_com", label: "Tiket.com", color: "#0064d2" },
  { id: "block", label: "Blocked", color: "#374151" },
];

function isDateInRange(targetDateStr: string, startStr: string, endStr: string): boolean {
  // start <= target < end (check-in day is booked, check-out day is morning departure)
  return targetDateStr >= startStr && targetDateStr < endStr;
}

function addDaysString(dateStr: string, days: number = 1): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, "0");
  const nextD = String(date.getDate()).padStart(2, "0");
  return `${nextY}-${nextM}-${nextD}`;
}

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CalendarView({
  villas,
  initialEvents,
  connections,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVillaId, setSelectedVillaId] = useState(villas[0]?.id || "");
  const [activeChannelFilter, setActiveChannelFilter] = useState("all");

  // Modals state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [clickedDate, setClickedDate] = useState<string | undefined>();

  const selectedVilla = villas.find((v) => v.id === selectedVillaId) || villas[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix (Monday-start)
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // JavaScript getDay() returns 0 for Sunday. Convert to Monday=0 .. Sunday=6:
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  // Previous month trailing days
  const prevMonthDays = new Date(year, month, 0).getDate();
  const calendarCells: {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  const todayStr = new Date().toISOString().split("T")[0];

  // Fill prev month padding
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Fill current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Fill remaining slots to reach multiple of 7
  const remaining = 7 - (calendarCells.length % 7);
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      calendarCells.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }
  }

  // Filter events based on active channel filter
  const filteredEvents = initialEvents.filter((ev) => {
    if (activeChannelFilter === "all") return true;
    if (activeChannelFilter === "block") return ev.type === "block";
    return ev.source === activeChannelFilter;
  });

  const getEventBadgeStyle = (event: CalendarEvent) => {
    if (event.type === "block") {
      return "bg-neutral-800 text-white border-neutral-700";
    }
    switch (event.source) {
      case "airbnb":
        return "bg-rose-500 text-white border-rose-600";
      case "agoda":
        return "bg-emerald-600 text-white border-emerald-700";
      case "booking_com":
        return "bg-blue-600 text-white border-blue-700";
      case "tiket_com":
        return "bg-sky-500 text-white border-sky-600";
      default:
        return "bg-(--accent) text-white border-(--accent-hover)";
    }
  };

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--foreground)">
              Availability &amp; Sync Calendar
            </h1>
            {villas.length > 1 ? (
              <select
                value={selectedVillaId}
                onChange={(e) => setSelectedVillaId(e.target.value)}
                className="text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white border border-(--border) rounded-lg text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--accent)"
              >
                {villas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 bg-(--background) text-(--foreground) rounded-lg border border-(--border)">
                {villas[0]?.name || "Numi Villa Pangandaran"}
              </span>
            )}
          </div>
          <p className="text-xs text-(--text-muted) mt-1">
            Master calendar powering Airbnb, Agoda, Booking.com, and Tiket.com iCal feeds
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Channel Drawer button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold bg-white border border-(--border) text-(--foreground) hover:bg-(--background) rounded-xl transition-colors shadow-2xs text-center"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Channel Feeds</span>
          </button>

          {/* Block dates button */}
          <button
            onClick={() => {
              setClickedDate(undefined);
              setIsBlockModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-white bg-(--foreground) hover:bg-(--sidebar-bg) rounded-xl transition-colors shadow-2xs text-center"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Block Dates</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Channel Filter Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-(--border)">
        {/* Month Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 sm:p-2 border border-(--border) rounded-xl hover:bg-(--background) text-(--foreground) transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold border border-(--border) rounded-xl hover:bg-(--background) text-(--foreground) transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 border border-(--border) rounded-xl hover:bg-(--background) text-(--foreground) transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-(--foreground) ml-1.5">
            {monthName} {year}
          </h2>
        </div>

        {/* Legend / Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] sm:text-xs text-(--text-muted) mr-0.5 sm:mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {CHANNEL_FILTERS.map((f) => {
            const isActive = activeChannelFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveChannelFilter(f.id)}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium border transition-colors ${
                  isActive
                    ? "bg-(--foreground) text-white border-(--foreground)"
                    : "bg-white text-(--foreground) border-(--border) hover:bg-(--background)"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                  style={{ background: f.color }}
                />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-(--border) overflow-hidden shadow-2xs">
        {/* Mobile Swipe / Tap Hint */}
        <div className="md:hidden px-3.5 py-2 bg-neutral-50/80 border-b border-(--border) text-[11px] text-(--text-muted) flex items-center justify-between">
          <span>← Swipe horizontally for full week →</span>
          <span className="font-semibold text-(--accent)">Tap date to block</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[650px] md:min-w-0">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-(--border) bg-(--background)/50 text-center text-xs font-bold text-(--text-muted) py-2.5 sm:py-3">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>

            {/* Date Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-(--border)">
              {calendarCells.map((cell) => {
                // Find events active on this date
                const eventsOnThisDay = filteredEvents.filter((ev) =>
                  isDateInRange(cell.dateStr, ev.startDate, ev.endDate)
                );

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => {
                      setClickedDate(cell.dateStr);
                      setIsBlockModalOpen(true);
                    }}
                    className={`min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                      cell.isCurrentMonth
                        ? "bg-white hover:bg-(--background)/40"
                        : "bg-gray-50/50 text-gray-400"
                    }`}
                  >
                    {/* Day Number Row */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center text-[11px] sm:text-xs font-semibold w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                          cell.isToday
                            ? "bg-(--foreground) text-white"
                            : cell.isCurrentMonth
                              ? "text-(--foreground)"
                              : "text-gray-400"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      <span className="opacity-0 group-hover:opacity-100 text-[9px] sm:text-[10px] text-(--accent) transition-opacity font-medium">
                        + Block
                      </span>
                    </div>

                    {/* Event Pills for this day */}
                    <div className="space-y-1 overflow-hidden flex-1">
                      {eventsOnThisDay.slice(0, 3).map((ev) => (
                        <button
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`w-full text-left px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium truncate block shadow-2xs transition-transform hover:scale-[1.02] ${getEventBadgeStyle(
                            ev
                          )}`}
                        >
                          {ev.type === "block" ? "🔒 " : ""}
                          {ev.title}
                        </button>
                      ))}
                      {eventsOnThisDay.length > 3 && (
                        <span className="text-[9px] sm:text-[10px] font-semibold text-(--text-muted) pl-1 block">
                          +{eventsOnThisDay.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Drawer */}
      <BlockDatesModal
        key={`block-modal-${isBlockModalOpen ? clickedDate || "default" : "closed"}`}
        isOpen={isBlockModalOpen}
        onClose={() => {
          setIsBlockModalOpen(false);
          setClickedDate(undefined);
        }}
        villas={villas}
        initialVillaId={selectedVilla.id}
        initialStartDate={clickedDate || getTodayString()}
        initialEndDate={
          clickedDate
            ? addDaysString(clickedDate, 1)
            : addDaysString(getTodayString(), 1)
        }
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <ChannelSyncDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        villa={selectedVilla}
        connections={connections}
      />
    </div>
  );
}

