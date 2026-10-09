"use client";

import React, { useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Trash2, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteCalendarBlock } from "@/lib/calendar/actions";
import { formatDate, formatCurrency, calculateNights } from "@/lib/utils/formatters";
import type { CalendarEvent } from "@/types/database";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const SOURCE_LABELS: Record<string, { name: string; bg: string; text: string }> = {
  direct: { name: "Direct Booking", bg: "bg-amber-50", text: "text-amber-800" },
  airbnb: { name: "Airbnb", bg: "bg-rose-50", text: "text-rose-700" },
  agoda: { name: "Agoda", bg: "bg-emerald-50", text: "text-emerald-700" },
  booking_com: { name: "Booking.com", bg: "bg-blue-50", text: "text-blue-700" },
  tiket_com: { name: "Tiket.com", bg: "bg-sky-50", text: "text-sky-700" },
  block: { name: "Manual Block", bg: "bg-neutral-100", text: "text-neutral-800" },
};

export function EventDetailModal({
  event,
  onClose,
  onSuccess,
}: EventDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmUnblock, setShowConfirmUnblock] = React.useState(false);

  if (!event) return null;

  const isBlock = event.type === "block";
  const nights = calculateNights(event.startDate, event.endDate);
  const badge = SOURCE_LABELS[event.source] || {
    name: event.source.toUpperCase(),
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteCalendarBlock(event.rawId);
        setShowConfirmUnblock(false);
        onSuccess?.();
        onClose();
      } catch (err) {
        console.error("Failed to delete block:", err);
      }
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl border border-(--border) shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-(--border)">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.name}
              </span>
              <span className="text-xs text-(--text-muted)">
                {isBlock ? "Calendar Restriction" : event.status || "Confirmed"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-(--text-muted) hover:text-(--foreground) hover:bg-(--background) rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground)">
                {isBlock ? event.reason || "Blocked Dates" : event.guestName || event.title}
              </h3>
              {event.bookingCode && (
                <p className="text-xs text-(--text-muted) mt-0.5">
                  Ref Code: <span className="font-mono">{event.bookingCode}</span>
                </p>
              )}
            </div>

            {/* Dates row */}
            <div className="bg-(--background) rounded-xl p-4 space-y-2 border border-(--border)">
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--text-muted) flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-(--accent)" />
                  Check-in / Start:
                </span>
                <span className="font-semibold text-(--foreground)">
                  {formatDate(event.startDate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--text-muted) flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-(--accent)" />
                  Check-out / End:
                </span>
                <span className="font-semibold text-(--foreground)">
                  {formatDate(event.endDate)}
                </span>
              </div>
              <div className="border-t border-(--border) pt-2 flex items-center justify-between text-xs text-(--text-muted)">
                <span>Total Duration</span>
                <span className="font-medium text-(--foreground)">
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* If block: show target channels */}
            {isBlock && event.targetChannels && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-2">
                  Blocked On:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {event.targetChannels.includes("all") ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                      All Channels &amp; Direct
                    </span>
                  ) : (
                    event.targetChannels.map((ch) => (
                      <span
                        key={ch}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 capitalize"
                      >
                        {ch.replace("_", ".")}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* If booking with total amount */}
            {!isBlock && event.totalAmount !== undefined && event.totalAmount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-(--background) border border-(--border)">
                <span className="text-xs text-(--text-muted)">Total Reservation</span>
                <span className="text-base font-bold text-(--foreground)">
                  {formatCurrency(event.totalAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-(--background)/50 border-t border-(--border) flex items-center justify-between">
            {isBlock ? (
              <button
                type="button"
                onClick={() => setShowConfirmUnblock(true)}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Unblock &amp; Reopen Dates
              </button>
            ) : event.source === "direct" ? (
              <Link
                href="/invoices"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-(--foreground) hover:bg-(--sidebar-bg) rounded-xl transition-colors text-center"
              >
                <FileText className="w-4 h-4" />
                View Invoices &amp; Billing
              </Link>
            ) : (
              <div className="text-xs text-(--text-muted) italic text-center w-full">
                Synchronized via {badge.name} iCal Feed
              </div>
            )}
          </div>
        </motion.div>

        {/* Custom Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmUnblock}
          onClose={() => setShowConfirmUnblock(false)}
          onConfirm={handleConfirmDelete}
          title="Remove Calendar Block?"
          description={`Are you sure you want to unblock ${formatDate(event.startDate)} to ${formatDate(event.endDate)}? This will remove restrictions and reopen availability for new bookings.`}
          confirmText="Yes, Unblock Dates"
          cancelText="Keep Blocked"
          variant="danger"
          isLoading={isPending}
        />
      </div>
    </AnimatePresence>
  );
}

