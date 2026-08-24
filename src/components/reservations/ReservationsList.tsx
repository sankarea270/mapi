"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ReservationRecord } from "@/lib/reservation";
import { cn } from "@/lib/utils";

export function ReservationsList() {
  const t = useTranslations("reservas");
  const [records, setRecords] = useState<ReservationRecord[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("mapi-reservations") ?? "[]") as ReservationRecord[];
      setRecords(stored);
    } catch {
      setRecords([]);
    }
  }, []);

  const updateStatus = (code: string, status: ReservationRecord["status"]) => {
    const next = records.map((record) =>
      record.code === code ? { ...record, status } : record
    );
    setRecords(next);
    localStorage.setItem("mapi-reservations", JSON.stringify(next));
  };

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-base text-slate-600">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div
          key={record.code}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-sm font-bold text-slate-800">
                {record.code}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                  record.status === "pending" && "bg-amber-100 text-amber-700",
                  record.status === "confirmed" && "bg-emerald-100 text-emerald-700",
                  record.status === "cancelled" && "bg-red-100 text-red-700"
                )}
              >
                {t(`status.${record.status}`)}
              </span>
            </div>
            <div className="flex gap-2">
              {record.status !== "confirmed" && (
                <button
                  type="button"
                  onClick={() => updateStatus(record.code, "confirmed")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  <CheckCircle2 className="size-3.5" />
                  {t("confirm")}
                </button>
              )}
              {record.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => updateStatus(record.code, "cancelled")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <XCircle className="size-3.5" />
                  {t("cancel")}
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-base font-semibold text-slate-900">{record.tourName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t("date")}: {record.date} · {t("travelers")}: {record.travelers}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {record.fullName} · {record.whatsapp}
          </p>
        </div>
      ))}
    </div>
  );
}