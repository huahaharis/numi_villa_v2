"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Pencil } from "lucide-react";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  { label: "S", key: "sun" },
  { label: "M", key: "mon" },
  { label: "T", key: "tue" },
  { label: "W", key: "wed" },
  { label: "T", key: "thu" },
  { label: "F", key: "fri" },
  { label: "S", key: "sat" },
];

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string): string {
  if (!dateString) return "";
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  required,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return parseLocalDate(value);
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setViewDate(parseLocalDate(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    const dateString = formatLocalDate(date);
    setSelectedDate(dateString);
    setViewDate(date);
  };

  const handleOk = () => {
    if (selectedDate) {
      onChange(selectedDate);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setSelectedDate(value);
    setIsOpen(false);
  };

  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : "";

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-(--foreground) mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm bg-(--background) border border-(--border) rounded-lg text-(--foreground) hover:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-colors"
      >
        <span className={displayValue ? "text-(--foreground)" : "text-(--text-muted)"}>
          {displayValue || placeholder}
        </span>
        <Calendar className="w-4 h-4 text-(--text-muted)" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-(--background) border border-(--border) rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-(--sidebar-bg) p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                SELECT DATE
              </span>
              <Pencil className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-semibold text-white">
              {displayValue || placeholder}
            </p>
          </div>

          {/* Calendar */}
          <div className="p-4">
            {/* Month / Year */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--foreground) hover:bg-(--border) transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-(--foreground)">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--foreground) hover:bg-(--border) transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day.key}
                  className="text-center text-xs font-medium text-(--text-muted) py-1"
                >
                  {day.label}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateString = formatLocalDate(new Date(year, month, day));
                const isSelected = dateString === selectedDate;
                const isToday =
                  dateString === formatLocalDate(new Date());

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors ${
                      isSelected
                        ? "bg-(--foreground) text-white font-medium"
                        : isToday
                          ? "border border-(--foreground) text-(--foreground)"
                          : "text-(--foreground) hover:bg-(--border)"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-(--border)">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-(--text-muted) hover:text-(--foreground) transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOk}
              className="px-4 py-2 text-sm font-medium text-(--foreground) hover:bg-(--border) rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
