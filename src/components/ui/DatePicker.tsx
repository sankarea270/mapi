"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  hasError?: boolean;
  label: string;
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const DAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function DatePicker({ value, onChange, hasError, label }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);

  const displayDate = value
    ? new Date(value + "T00:00:00").toLocaleDateString("es-PE", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div ref={ref} className="relative">
      <label className="eyebrow block text-slate-400">{label}</label>
      {/* Campo con filete inferior, igual que el resto del formulario: sin la
          caja de icono, que es lo que daba el aire de plantilla. */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-3 border-0 border-b bg-transparent px-0 py-2.5 text-left transition-colors",
          hasError
            ? "border-red-400"
            : isOpen
              ? "border-teal-500"
              : "border-slate-200 hover:border-slate-400"
        )}
      >
        <span
          className={cn(
            "truncate text-[15px]",
            value ? "text-slate-900" : "text-slate-300"
          )}
        >
          {value ? displayDate : label}
        </span>
        <CalendarDays
          className={cn(
            "size-4 shrink-0 transition-colors",
            isOpen ? "text-teal-600" : "text-slate-300"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() =>
                setViewDate((d) =>
                  d.month === 0
                    ? { year: d.year - 1, month: 11 }
                    : { year: d.year, month: d.month - 1 }
                )
              }
              className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-semibold text-slate-900">
              {MONTHS_ES[viewDate.month]} {viewDate.year}
            </p>
            <button
              type="button"
              onClick={() =>
                setViewDate((d) =>
                  d.month === 11
                    ? { year: d.year + 1, month: 0 }
                    : { year: d.year, month: d.month + 1 }
                )
              }
              className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 p-px">
            {DAYS_ES.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-slate-400">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-white" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              const isPast = new Date(dateStr) < new Date(todayStr);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    onChange(dateStr);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "aspect-square bg-white text-sm font-medium transition-all",
                    isPast && "cursor-not-allowed text-slate-200",
                    !isPast && !isSelected && "hover:bg-amber-50 hover:text-amber-700",
                    isSelected && "bg-amber-400 font-bold text-slate-900 shadow-md shadow-amber-400/30",
                    isToday && !isSelected && "ring-2 ring-amber-400/50"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}