"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, MessageCircle, User, Mail, Phone, Send, MapPin } from "lucide-react";
import { createReservation } from "@/app/actions/reserve";
import { reservationSchema, type ReservationRecord } from "@/lib/reservation";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker";

interface BookingFormProps {
  tourName?: string;
  submitLabel?: string;
  onSaved?: (record: ReservationRecord) => void;
}

export function BookingForm({ tourName, submitLabel, onSaved }: BookingFormProps) {
  const t = useTranslations("reserva");
  const [form, setForm] = useState({
    tourName: tourName ?? "",
    date: "",
    travelers: "2",
    fullName: "",
    email: "",
    whatsapp: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<ReservationRecord | null>(null);

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const errorMessage = (field: string): string | undefined => {
    if (!errors[field]) return undefined;
    return t(`errors.${errors[field]}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const parsed = reservationSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") nextErrors[path] = issue.message;
      }
      setErrors(nextErrors);
      setSubmitting(false);
      return;
    }

    const result = await createReservation({
      ...parsed.data,
      website: form.website,
    });
    if (!result.ok || !result.code) {
      setErrors({ fullName: "server" });
      setSubmitting(false);
      return;
    }

    const record: ReservationRecord = {
      ...parsed.data,
      code: result.code,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("mapi-reservations") ?? "[]") as ReservationRecord[];
      localStorage.setItem("mapi-reservations", JSON.stringify([record, ...existing]));
    } catch {}

    setSuccess(record);
    onSaved?.(record);
    setSubmitting(false);
  };

  if (success) {
    const whatsappText = [
      `Hola, confirmo mi reserva ${success.code}.`,
      `Tour: ${success.tourName}`,
      `Fecha: ${success.date}`,
      `Viajeros: ${success.travelers}`,
      `Nombre: ${success.fullName}`,
    ].join("\n");

    return (
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center ring-1 ring-emerald-100">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-400/30">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mt-5 font-heading text-xl font-bold text-slate-900">{t("successTitle")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("successBody")}</p>
        <p className="mt-5 inline-block rounded-2xl bg-emerald-600 px-5 py-2 font-mono text-sm font-bold text-white shadow-md shadow-emerald-600/20">
          {success.code}
        </p>
        <div className="mt-6">
          <a
            href={whatsappLink(whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#25D366] px-7 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-105"
          >
            <MessageCircle className="size-4" />
            {t("whatsappConfirm")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="booking-website">Website</label>
        <input
          id="booking-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      {!tourName && (
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
            {t("tour")}
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
            <input
              id="booking-tour"
              type="text"
              value={form.tourName}
              onChange={(e) => setField("tourName", e.target.value)}
              placeholder={t("tourPlaceholder")}
              className={cn(
                "w-full rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all",
                errors.tourName
                  ? "border-red-300 ring-2 ring-red-500/20"
                  : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              )}
            />
          </div>
          {errors.tourName && <p className="mt-1.5 text-xs text-red-500">{t(`errors.${errors.tourName}`)}</p>}
        </div>
      )}

      <DatePicker
        value={form.date}
        onChange={(date) => setField("date", date)}
        hasError={Boolean(errors.date)}
        label={t("date")}
      />
      {errors.date && <p className="mt-1.5 text-xs text-red-500">{errorMessage("date")}</p>}

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
          {t("travelers")}
        </label>
        <div className="flex gap-2">
          {["1", "2", "3", "4", "5", "6+"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setField("travelers", num.replace("+", ""))}
              className={cn(
                "flex-1 rounded-xl py-3 text-sm font-medium transition-all",
                form.travelers === num || (num === "6+" && Number(form.travelers) >= 6)
                  ? "bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {num}
            </button>
          ))}
        </div>
        {errors.travelers && <p className="mt-1.5 text-xs text-red-500">{errorMessage("travelers")}</p>}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
          {t("fullName")}
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
          <input
            id="booking-name"
            type="text"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder={t("fullNamePlaceholder")}
            className={cn(
              "w-full rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all",
              errors.fullName
                ? "border-red-300 ring-2 ring-red-500/20"
                : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            )}
          />
        </div>
        {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errorMessage("fullName")}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
            {t("email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
            <input
              id="booking-email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="tu@correo.com"
              className={cn(
                "w-full rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all",
                errors.email
                  ? "border-red-300 ring-2 ring-red-500/20"
                  : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              )}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errorMessage("email")}</p>}
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
            {t("whatsapp")}
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
            <input
              id="booking-whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setField("whatsapp", e.target.value)}
              placeholder="+51 999 999 999"
              className={cn(
                "w-full rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all",
                errors.whatsapp
                  ? "border-red-300 ring-2 ring-red-500/20"
                  : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              )}
            />
          </div>
          {errors.whatsapp && <p className="mt-1.5 text-xs text-red-500">{errorMessage("whatsapp")}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
          {t("message")}
        </label>
        <textarea
          id="booking-message"
          rows={3}
          value={form.message}
          onChange={(e) => setField("message", e.target.value)}
          placeholder={t("messagePlaceholder")}
          className={cn(
            "w-full resize-none rounded-2xl border bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all",
            errors.messageMax
              ? "border-red-300 ring-2 ring-red-500/20"
              : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          )}
        />
        {errors.messageMax && <p className="mt-1.5 text-xs text-red-500">{errorMessage("messageMax")}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-400/30 disabled:opacity-60 disabled:hover:scale-100"
      >
        <Send className="size-4" />
        {submitting ? t("submitting") : (submitLabel ?? t("submit"))}
      </button>
      <p className="text-center text-xs text-slate-400">
        Sin compromiso · Resposta en 24h
      </p>
    </form>
  );
}