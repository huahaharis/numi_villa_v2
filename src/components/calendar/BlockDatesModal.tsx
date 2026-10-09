"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, AlertCircle, Loader2 } from "lucide-react";
import { createCalendarBlock } from "@/lib/calendar/actions";
import type { Villa } from "@/types/database";

interface BlockDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  villas: Villa[];
  initialVillaId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onSuccess?: () => void;
}

const AVAILABLE_CHANNELS = [
  { id: "airbnb", name: "Airbnb", color: "#ff385c" },
  { id: "agoda", name: "Agoda", color: "#00a651" },
  { id: "booking_com", name: "Booking.com", color: "#003580" },
  { id: "tiket_com", name: "Tiket.com", color: "#0064d2" },
  { id: "direct", name: "Direct / Website", color: "#b07d62" },
];

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

export function BlockDatesModal({
  isOpen,
  onClose,
  villas,
  initialVillaId,
  initialStartDate,
  initialEndDate,
  onSuccess,
}: BlockDatesModalProps) {
  const [villaId, setVillaId] = useState(initialVillaId || villas[0]?.id || "");
  const [startDate, setStartDate] = useState(initialStartDate || getTodayString());
  const [endDate, setEndDate] = useState(
    initialEndDate || (initialStartDate ? addDaysString(initialStartDate, 1) : addDaysString(getTodayString(), 1))
  );
  const [reason, setReason] = useState("");
  const [allChannels, setAllChannels] = useState(true);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "airbnb",
    "agoda",
    "booking_com",
    "tiket_com",
    "direct",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleToggleChannel = (channelId: string) => {
    if (allChannels) {
      setAllChannels(false);
      setSelectedChannels([channelId]);
      return;
    }

    if (selectedChannels.includes(channelId)) {
      const next = selectedChannels.filter((c) => c !== channelId);
      setSelectedChannels(next);
      if (next.length === 0) setAllChannels(false);
    } else {
      const next = [...selectedChannels, channelId];
      setSelectedChannels(next);
      if (next.length === AVAILABLE_CHANNELS.length) {
        setAllChannels(true);
      }
    }
  };

  const handleToggleAll = (checked: boolean) => {
    setAllChannels(checked);
    if (checked) {
      setSelectedChannels(AVAILABLE_CHANNELS.map((c) => c.id));
    } else {
      setSelectedChannels([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!villaId) {
      setError("Please select a villa.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please specify both start date and end date.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }
    if (!allChannels && selectedChannels.length === 0) {
      setError("Please select at least one channel to block.");
      return;
    }

    startTransition(async () => {
      try {
        await createCalendarBlock({
          villaId,
          startDate,
          endDate,
          reason: reason.trim() || "Owner Block",
          targetChannels: allChannels ? ["all"] : selectedChannels,
        });
        onSuccess?.();
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to block dates");
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
          className="bg-white rounded-2xl border border-(--border) shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-(--border)">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-(--background) flex items-center justify-center text-(--accent) shrink-0">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-(--foreground)">
                  Block Availability
                </h3>
                <p className="text-[11px] sm:text-xs text-(--text-muted)">
                  Close dates or apply channel-specific restrictions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-(--text-muted) hover:text-(--foreground) hover:bg-(--background) rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            {/* Property Display / Selector */}
            {villas.length > 1 ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-1.5 sm:mb-2">
                  Property / Villa
                </label>
                <select
                  value={villaId}
                  onChange={(e) => setVillaId(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-(--background) border border-(--border) rounded-xl text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)"
                >
                  {villas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-1.5">
                  Property
                </label>
                <div className="w-full px-3.5 py-2 text-xs font-semibold bg-(--background) border border-(--border) rounded-xl text-(--foreground)">
                  {villas[0]?.name || "Numi Villa Pangandaran"}
                </div>
              </div>
            )}

            {/* Dates (1 col on mobile, 2 col on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-1.5 sm:mb-2">
                  Check-in / Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-(--background) border border-(--border) rounded-xl text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-1.5 sm:mb-2">
                  Check-out / End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-(--background) border border-(--border) rounded-xl text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)"
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-2">
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Maintenance, Owner stay, Airbnb exclusive promo"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-(--background) border border-(--border) rounded-xl text-(--foreground) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent)"
              />
            </div>

            {/* Target Channels */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
                  Apply Block To:
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-(--accent)">
                  <input
                    type="checkbox"
                    checked={allChannels}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                    className="rounded text-(--accent) focus:ring-(--accent)"
                  />
                  All Channels
                </label>
              </div>

              <div className="space-y-2 border border-(--border) rounded-xl p-3 bg-(--background)/50">
                {AVAILABLE_CHANNELS.map((ch) => {
                  const isChecked = allChannels || selectedChannels.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-white border-(--border) shadow-2xs"
                          : "bg-transparent border-transparent opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: ch.color }}
                        />
                        <span className="text-sm font-medium text-(--foreground)">
                          {ch.name}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleChannel(ch.id)}
                        className="w-4 h-4 rounded text-(--accent) focus:ring-(--accent)"
                      />
                    </label>
                  );
                })}
              </div>

              <p className="text-[11px] text-(--text-muted) mt-2 italic flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {allChannels
                  ? "Dates will be marked unavailable across all connected OTAs and your direct calendar."
                  : `Selected: ${selectedChannels.join(", ") || "None"}. Unchecked channels will remain open.`}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-3 border-t border-(--border)">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-medium text-(--foreground) hover:bg-(--background) rounded-xl transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-(--foreground) hover:bg-(--sidebar-bg) rounded-xl transition-colors disabled:opacity-50 text-center"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Apply Block"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

