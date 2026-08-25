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
        className="sticky top-16 z-30 flex gap-7 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-0"
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
                "eyebrow relative shrink-0 py-4 transition-colors outline-none focus-visible:text-teal-700",
                selected ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
              )}
            >
              {tab.label}
              {selected && (
                /* Filete que crece desde el origen: el movimiento indica de
                   dónde viene la selección, en vez de aparecer de golpe. */
                <span className="underline-grow absolute inset-x-0 -bottom-px h-0.5 bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white py-8 sm:py-10">
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