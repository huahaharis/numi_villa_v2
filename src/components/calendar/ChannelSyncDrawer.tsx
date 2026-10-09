"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  Globe,
  ArrowDownLeft,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { saveChannelConnection, syncChannelFeeds } from "@/lib/calendar/actions";
import type { Villa, ChannelConnection } from "@/types/database";

interface ChannelSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  villa: Villa;
  connections: ChannelConnection[];
  onSyncComplete?: () => void;
}

const DEFAULT_LIVE_DOMAIN = "https://www.numivilla.my.id";

const CHANNELS_CONFIG = [
  {
    id: "airbnb",
    name: "Airbnb",
    channelFile: "airbnb.ics",
    color: "#ff385c",
    outboundHelp: "Airbnb Host > Listings > Availability settings > Connect calendars > Import calendar",
    inboundHelp: "Airbnb Host > Listings > Availability settings > Connect calendars > Export calendar",
  },
  {
    id: "agoda",
    name: "Agoda",
    channelFile: "agoda.ics",
    color: "#00a651",
    outboundHelp: "Agoda Homes / YCS > Calendar > Calendar Sync > Import calendar",
    inboundHelp: "Agoda Homes / YCS > Calendar > Calendar Sync > Export calendar",
  },
  {
    id: "booking_com",
    name: "Booking.com",
    channelFile: "booking_com.ics",
    color: "#003580",
    outboundHelp: "Booking Extranet > Rates & Availability > Sync calendars > Import calendar",
    inboundHelp: "Booking Extranet > Rates & Availability > Sync calendars > Export calendar",
  },
  {
    id: "tiket_com",
    name: "Tiket.com",
    channelFile: "tiket_com.ics",
    color: "#0064d2",
    outboundHelp: "Tiket Extranet > Calendar > Calendar Sync > Import iCal",
    inboundHelp: "Tiket Extranet > Calendar > Calendar Sync > Export iCal",
  },
];

function getInitialDomain(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("numi_ical_production_url");
    if (saved && saved.startsWith("http")) return saved.replace(/\/+$/, "");

    const origin = window.location.origin;
    // Do NOT default to localhost for iCal feeds — always default to live domain
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return origin.replace(/\/+$/, "");
    }
  }
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || DEFAULT_LIVE_DOMAIN;
}

export function ChannelSyncDrawer({
  isOpen,
  onClose,
  villa,
  connections,
  onSyncComplete,
}: ChannelSyncDrawerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"outbound" | "inbound">("outbound");
  const [productionUrl, setProductionUrl] = useState<string>(getInitialDomain);

  const [urls, setUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const c of connections) {
      map[c.channelName] = c.inboundUrl || "";
    }
    return map;
  });
  const [savedChannel, setSavedChannel] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSyncing, startSync] = useTransition();

  if (!isOpen) return null;

  // Count configured inbound feeds
  const configuredChannelsCount = CHANNELS_CONFIG.filter(
    (ch) => Boolean(urls[ch.id]?.trim()) || Boolean(connections.find((c) => c.channelName === ch.id)?.inboundUrl)
  ).length;

  const getFeedUrl = (channelFile: string) => {
    const base = (productionUrl || DEFAULT_LIVE_DOMAIN).trim().replace(/\/+$/, "");
    const slug = villa.slug || "numi-villa-pangandaran";
    return `${base}/api/ical/${slug}/${channelFile}`;
  };

  const getMasterFeedUrl = () => {
    const base = (productionUrl || DEFAULT_LIVE_DOMAIN).trim().replace(/\/+$/, "");
    const slug = villa.slug || "numi-villa-pangandaran";
    return `${base}/api/ical/${slug}.ics`;
  };

  const handleUpdateDomain = (newUrl: string) => {
    setProductionUrl(newUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("numi_ical_production_url", newUrl);
    }
  };

  const handleResetDomain = () => {
    setProductionUrl(DEFAULT_LIVE_DOMAIN);
    if (typeof window !== "undefined") {
      localStorage.setItem("numi_ical_production_url", DEFAULT_LIVE_DOMAIN);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveUrl = (channelName: string) => {
    startTransition(async () => {
      try {
        await saveChannelConnection({
          villaId: villa.id,
          channelName,
          inboundUrl: urls[channelName]?.trim() || "",
        });
        setSavedChannel(channelName);
        setTimeout(() => setSavedChannel(null), 2500);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to save channel URL");
      }
    });
  };

  const handleTriggerSync = () => {
    setSyncStatus(null);

    // If 0 channels have saved URLs, prompt user and switch tab
    if (configuredChannelsCount === 0) {
      setActiveTab("inbound");
      setSyncStatus(
        "⚠️ No channel URLs configured yet. Paste and save your OTA export calendar URLs in the Inbound Feeds tab below, then click Sync Now."
      );
      return;
    }

    startSync(async () => {
      try {
        const res = await syncChannelFeeds(villa.id);
        const imported = res.syncedCount;
        setSyncStatus(
          `Sync finished successfully! ${imported} new reservation(s) imported into calendar.`
        );
        onSyncComplete?.();
      } catch (err: unknown) {
        setSyncStatus(`Sync error: ${err instanceof Error ? err.message : "Failed to fetch feeds"}`);
      }
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-(--border) flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-(--border)">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-(--foreground)">
                iCal Channel Synchronization
              </h3>
              <p className="text-xs text-(--text-muted)">
                Property: <span className="font-semibold text-(--foreground)">{villa.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-(--text-muted) hover:text-(--foreground) hover:bg-(--background) rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sync Trigger Action Banner */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-(--background) border-b border-(--border) flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-(--foreground)">
                  Instant Channel Sync
                </p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    configuredChannelsCount > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {configuredChannelsCount} of {CHANNELS_CONFIG.length} configured
                </span>
              </div>
              <p className="text-[11px] text-(--text-muted) mt-0.5">
                {configuredChannelsCount > 0
                  ? "Pull fresh bookings from all configured OTA export links"
                  : "Paste OTA export links in 'Inbound Feeds' to sync reservations"}
              </p>
            </div>
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-(--foreground) hover:bg-(--sidebar-bg) rounded-xl transition-colors disabled:opacity-50 shrink-0 shadow-2xs text-center"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{syncStatus}</div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-(--border) px-4 sm:px-6 pt-3 sm:pt-4 gap-4 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("outbound")}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "outbound"
                  ? "border-(--accent) text-(--foreground)"
                  : "border-transparent text-(--text-muted) hover:text-(--foreground)"
              }`}
            >
              <span>Outbound</span>
              <span className="hidden sm:inline">Feeds (Export to OTAs)</span>
              <span className="sm:hidden">(Export)</span>
            </button>
            <button
              onClick={() => setActiveTab("inbound")}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "inbound"
                  ? "border-(--accent) text-(--foreground)"
                  : "border-transparent text-(--text-muted) hover:text-(--foreground)"
              }`}
            >
              <span>Inbound</span>
              <span className="hidden sm:inline">Feeds (Import to Numi Villa)</span>
              <span className="sm:hidden">(Import)</span>
              {configuredChannelsCount > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                  {configuredChannelsCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
            {activeTab === "outbound" ? (
              <div className="space-y-5">
                {/* Live Production URL Configuration Box */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-950">
                        Live Website Domain (Public iCal Base URL)
                      </span>
                    </div>
                    {productionUrl !== DEFAULT_LIVE_DOMAIN && (
                      <button
                        type="button"
                        onClick={handleResetDomain}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset to default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={productionUrl}
                      onChange={(e) => handleUpdateDomain(e.target.value)}
                      placeholder="https://www.numivilla.my.id"
                      className="w-full text-xs font-mono bg-white px-3 py-2 rounded-lg border border-blue-200 text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--accent)"
                    />
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    OTAs (Airbnb, Agoda, Booking.com) require your live production domain to read your calendar. All copyable links below automatically use this address.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                  <strong>How Outbound Works:</strong> Copy each channel link below and paste it into the <em>&quot;Import Calendar&quot;</em> section in each respective OTA extranet. Whenever you block a date or receive a booking, that platform will automatically update.
                </div>

                {/* Dedicated Feeds */}
                {CHANNELS_CONFIG.map((ch) => {
                  const feedUrl = getFeedUrl(ch.channelFile);
                  const isCopied = copiedKey === ch.id;

                  return (
                    <div
                      key={ch.id}
                      className="p-4 rounded-xl border border-(--border) bg-white space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: ch.color }}
                          />
                          <h4 className="text-sm font-bold text-(--foreground)">
                            {ch.name} Dedicated Feed
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-(--text-muted) bg-(--background) px-2 py-0.5 rounded font-semibold">
                          Selective Filter
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={feedUrl}
                          className="w-full text-xs font-mono bg-(--background) px-3 py-2 rounded-lg border border-(--border) text-(--foreground) select-all"
                        />
                        <button
                          onClick={() => handleCopy(ch.id, feedUrl)}
                          className="p-2 border border-(--border) rounded-lg hover:bg-(--background) text-(--foreground) transition-colors shrink-0"
                          title="Copy Link"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-(--text-muted)">
                        <strong>Paste location:</strong> {ch.outboundHelp}
                      </p>
                    </div>
                  );
                })}

                {/* Universal Combined Feed */}
                <div className="p-4 rounded-xl border border-(--border) bg-white space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-(--foreground)">
                      Universal Combined Feed (All Channels)
                    </h4>
                    <span className="text-[10px] font-mono text-(--text-muted) bg-(--background) px-2 py-0.5 rounded font-semibold">
                      Standard
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getMasterFeedUrl()}
                      className="w-full text-xs font-mono bg-(--background) px-3 py-2 rounded-lg border border-(--border) text-(--foreground) select-all"
                    />
                    <button
                      onClick={() => handleCopy("all", getMasterFeedUrl())}
                      className="p-2 border border-(--border) rounded-lg hover:bg-(--background) text-(--foreground) transition-colors shrink-0"
                      title="Copy Link"
                    >
                      {copiedKey === "all" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-(--text-muted)">
                    Includes all reservations and all blocked dates regardless of selective channel rules.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Inbound Setup Guide Box */}
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ArrowDownLeft className="w-4 h-4 text-blue-600 shrink-0" />
                    How to configure URL for &quot;Sync Now&quot;:
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-blue-900 leading-relaxed">
                    <li>Go to your listing extranet on Airbnb, Agoda, Booking.com, or Tiket.com.</li>
                    <li>Look for the <strong>Export Calendar</strong> option (it will provide an <code>.ics</code> link).</li>
                    <li>Paste that link into the corresponding channel input below and click <strong>Save</strong>.</li>
                    <li>Click <strong>Sync Now</strong> at the top to immediately fetch all reservations into Numi Villa.</li>
                  </ol>
                </div>

                {CHANNELS_CONFIG.map((ch) => {
                  const conn = connections.find((c) => c.channelName === ch.id);
                  const isSaved = savedChannel === ch.id;
                  const currentUrl = urls[ch.id]?.trim();
                  const isConfigured = Boolean(currentUrl) || Boolean(conn?.inboundUrl);

                  return (
                    <div
                      key={ch.id}
                      className="p-4 rounded-xl border border-(--border) bg-white space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: ch.color }}
                          />
                          <h4 className="text-sm font-bold text-(--foreground)">
                            {ch.name} Inbound iCal Link
                          </h4>
                        </div>
                        {isConfigured ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Connected
                          </span>
                        ) : (
                          <span className="text-[10px] text-(--text-muted) bg-(--background) px-2 py-0.5 rounded-full font-medium">
                            Not configured
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-(--text-muted)">
                        <strong>Where to copy:</strong> {ch.inboundHelp}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                          type="url"
                          placeholder={`Paste ${ch.name} export calendar .ics URL...`}
                          value={urls[ch.id] || ""}
                          onChange={(e) =>
                            setUrls((prev) => ({
                              ...prev,
                              [ch.id]: e.target.value,
                            }))
                          }
                          className="w-full text-xs bg-(--background) px-3 py-2.5 rounded-lg border border-(--border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--accent)"
                        />
                        <button
                          onClick={() => handleSaveUrl(ch.id)}
                          disabled={isPending}
                          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-(--foreground) hover:bg-(--sidebar-bg) rounded-lg transition-colors shrink-0 disabled:opacity-50 text-center"
                        >
                          {isSaved ? "Saved!" : "Save"}
                        </button>
                      </div>

                      {conn?.lastSyncedAt && (
                        <p className="text-[10px] text-(--text-muted) flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Last synced: {new Date(conn.lastSyncedAt).toLocaleString()}
                        </p>
                      )}
                      {conn?.syncError && (
                        <p className="text-[10px] text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Sync warning: {conn.syncError}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
