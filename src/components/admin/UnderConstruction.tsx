"use client";

import { Construction } from "lucide-react";

interface UnderConstructionProps {
  title?: string;
  subtitle?: string;
}

export function UnderConstruction({
  title = "Page Underconstruction",
  subtitle = "Sit back, a content will be shown here later.",
}: UnderConstructionProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="relative flex flex-col items-center text-center px-6 py-12 max-w-md w-full">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Icon circle */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-(--background) border border-(--border) flex items-center justify-center mb-6 shadow-sm">
          <Construction className="w-8 h-8 text-(--foreground)" />
        </div>

        {/* Text */}
        <h1 className="relative z-10 text-xl font-semibold text-(--foreground) mb-2">
          {title}
        </h1>
        <p className="relative z-10 text-sm text-(--text-muted) max-w-[240px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
