"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TourTabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon: ReactNode;
}

export function TourTabs({
  tabs,
  ariaLabel,
}: {
  tabs: TourTabItem[];
  ariaLabel: string;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="sticky top-16 z-30 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-0"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-5 py-4 text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-inset",
                selected
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.icon}
              {tab.label}
              {selected && (
                <span className="absolute inset-x-4 -bottom-px h-[3px] rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-b-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={tab.id !== active?.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}