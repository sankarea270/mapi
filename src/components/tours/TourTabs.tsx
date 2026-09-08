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
      {/* Pastillas y no rótulos sueltos con un filete debajo.
          El diseño anterior era texto de 11px en gris claro con un
          subrayado de 2px: al lado del bloque de "01 02 03 04" en petróleo
          que tiene justo encima, se leía como un pie de foto y no como la
          navegación de la ficha. Y encima traía un icono por pestaña que
          nunca llegaba a dibujarse. */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="sticky top-16 z-30 -mx-4 flex gap-1 overflow-x-auto bg-white/95 p-1.5 backdrop-blur-md sm:mx-0"
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
                "flex shrink-0 items-center gap-2.5 px-4 py-3 font-heading text-[13px] font-bold uppercase tracking-[0.1em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-5",
                selected
                  ? "bg-teal-700 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {/* El icono se atenúa en las no elegidas en lugar de
                  desaparecer: da forma reconocible a cada pestaña sin
                  competir con la que está abierta. */}
              <span className={cn("shrink-0", selected ? "text-amber-400" : "text-slate-400")}>
                {tab.icon}
              </span>
              {tab.label}
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