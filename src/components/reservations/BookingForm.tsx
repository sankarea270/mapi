"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker";
import { SentPanel } from "@/components/ui/SentPanel";
import { useWhatsappSend } from "@/hooks/useWhatsappSend";
import { guardarReserva } from "@/lib/reservas";

const TRAVELERS = [1, 2, 3, 4, 5, 6] as const;

interface BookingFormProps {
  tourSlug?: string;
  tourName?: string;
  /** Nivel del encabezado. "h1" cuando el formulario es toda la página. */
  encabezado?: "h1" | "h2";
}

/**
 * Formulario de reserva.
 *
 * Se organiza en tres bloques numerados —viaje, datos, detalles— con un
 * indicador de avance que se llena a medida que se completan. Da sensación
 * de progreso sin partir el formulario en pasos, que obligaría a ir y venir
 * para revisar lo escrito.
 *
 * Los campos son de filete inferior y con rótulo en versalita, sin el icono
 * dentro de cada uno: ese patrón, repetido campo a campo, es justo lo que
 * hace que un formulario parezca sacado de una plantilla.
 */
export function BookingForm({
  tourSlug = "",
  tourName = "",
  encabezado: Titulo = "h2",
}: BookingFormProps) {
  const t = useTranslations("reserva");
  const locale = useLocale();

  const [form, setForm] = useState({
    tourName,
    date: "",
    travelers: 2,
    fullName: "",
    email: "",
    whatsapp: "",
    message: "",
  });
  const [touched, setTouched] = useState(false);
  const { url, send, reset, isSent } = useWhatsappSend();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const errors = useMemo(
    () => ({
      date: form.date ? "" : t("errors.date"),
      fullName: form.fullName.trim().length >= 2 ? "" : t("errors.fullName"),
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "" : t("errors.email"),
      whatsapp: form.whatsapp.replace(/\D/g, "").length >= 8 ? "" : t("errors.whatsapp"),
      message: form.message.length <= 500 ? "" : t("errors.messageMax"),
    }),
    [form, t]
  );
  const isValid = Object.values(errors).every((e) => !e);

  /* Avance: cuántos de los cuatro campos obligatorios están resueltos. */
  const done = [!errors.date, !errors.fullName, !errors.email, !errors.whatsapp].filter(
    Boolean
  ).length;
  const progress = (done / 4) * 100;

  /* Los pares etiqueta/valor sirven para dos cosas: componer el mensaje de
     WhatsApp y mostrar el resumen de la confirmación. Se construyen una sola
     vez para que no puedan desincronizarse. */
  const resumen = (): Array<[string, string]> =>
    (
      [
        form.tourName ? [t("tour"), form.tourName] : null,
        [t("date"), form.date],
        [t("travelers"), String(form.travelers)],
        [t("fullName"), form.fullName],
        [t("email"), form.email],
        [t("whatsapp"), form.whatsapp],
        form.message ? [t("message"), form.message] : null,
      ] as Array<[string, string] | null>
    ).filter((x): x is [string, string] => x !== null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    send(
      resumen()
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    );
    /* Después de abrir WhatsApp, nunca antes: esperar aquí sacaría al
       `window.open` del gesto del usuario y el navegador lo bloquearía. */
    void guardarReserva({
      tourSlug,
      tourName: form.tourName,
      fullName: form.fullName,
      email: form.email,
      phone: form.whatsapp,
      date: form.date,
      travelers: form.travelers,
      message: form.message,
      locale,
    });
  };

  const field =
    "w-full border-0 border-b bg-transparent px-0 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-300 outline-none transition-colors focus:border-teal-500";

  const Legend = ({ n, children }: { n: number; children: React.ReactNode }) => (
    <div className="flex items-baseline gap-3 border-b border-slate-900 pb-2.5">
      <span className="font-heading text-sm font-bold text-amber-600">
        {String(n).padStart(2, "0")}
      </span>
      <h3 className="eyebrow text-slate-900">{children}</h3>
    </div>
  );

  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 pb-6 pt-7 sm:px-9">
        <p className="eyebrow text-teal-700">{t("step")}</p>
        {/* h1 cuando el formulario ES la página (/reservar), h2 cuando va
            dentro de otra que ya tiene su encabezado. La página de reservas
            se quedaba sin h1 porque aquí siempre había un h2: para Google,
            una página sin h1 no declara de qué trata. */}
        <Titulo className="mt-2 font-heading text-2xl font-bold tracking-tight text-slate-900">
          {t("title")}
        </Titulo>
        <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-slate-500">
          {t("subtitle")}
        </p>

        {/* Barra de avance: se llena conforme se resuelven los obligatorios. */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200">
            <div
              className="h-px bg-amber-500 transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="eyebrow shrink-0 text-slate-400">{done}/4</span>
        </div>
      </div>

      {isSent && url ? (
        <SentPanel url={url} summary={resumen()} onReset={reset} />
      ) : (
      <form onSubmit={submit} noValidate className="px-6 pb-8 pt-8 sm:px-9">
        <Legend n={1}>{t("sectionTrip")}</Legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {!tourSlug && (
            <div className="sm:col-span-2">
              <label htmlFor="bf-tour" className="eyebrow text-slate-400">
                {t("tour")}
              </label>
              <input
                id="bf-tour"
                type="text"
                value={form.tourName}
                onChange={(e) => set("tourName", e.target.value)}
                placeholder={t("tourPlaceholder")}
                className={cn(field, "border-slate-200")}
              />
            </div>
          )}
          <div>
            <DatePicker
              value={form.date}
              onChange={(d) => set("date", d)}
              hasError={touched && !!errors.date}
              label={t("date")}
            />
            {touched && errors.date && (
              <p className="mt-1.5 text-xs text-red-600">{errors.date}</p>
            )}
          </div>
          <div>
            <span className="eyebrow text-slate-400">{t("travelers")}</span>
            <div className="mt-2.5 flex overflow-hidden rounded-md ring-1 ring-slate-200">
              {TRAVELERS.map((n) => {
                const on = form.travelers === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("travelers", n)}
                    aria-pressed={on}
                    className={cn(
                      "flex-1 border-r border-slate-200 py-2.5 text-sm font-semibold transition-colors last:border-r-0",
                      on
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {n === 6 ? "6+" : n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Legend n={2}>{t("sectionContact")}</Legend>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="bf-name" className="eyebrow text-slate-400">
              {t("fullName")}
            </label>
            <input
              id="bf-name"
              type="text"
              required
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              className={cn(
                field,
                touched && errors.fullName ? "border-red-400" : "border-slate-200"
              )}
            />
            {touched && errors.fullName && (
              <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>
          <div>
            <label htmlFor="bf-email" className="eyebrow text-slate-400">
              {t("email")}
            </label>
            <input
              id="bf-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder={t("emailPlaceholder")}
              className={cn(
                field,
                touched && errors.email ? "border-red-400" : "border-slate-200"
              )}
            />
            {touched && errors.email && (
              <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="bf-wa" className="eyebrow text-slate-400">
              {t("whatsapp")}
            </label>
            <input
              id="bf-wa"
              type="tel"
              required
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder={t("whatsappPlaceholder")}
              className={cn(
                field,
                touched && errors.whatsapp ? "border-red-400" : "border-slate-200"
              )}
            />
            {touched && errors.whatsapp && (
              <p className="mt-1.5 text-xs text-red-600">{errors.whatsapp}</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <Legend n={3}>{t("sectionExtras")}</Legend>
        </div>
        <div className="mt-6">
          <textarea
            id="bf-msg"
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder={t("messagePlaceholder")}
            className={cn(field, "resize-none border-slate-200")}
          />
          <div className="mt-1.5 flex justify-between text-xs text-slate-400">
            <span className="text-red-600">{touched && errors.message}</span>
            <span>{form.message.length}/500</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-relaxed text-slate-500">
            {t("noPayment")}
          </p>
          <button
            type="submit"
            className="shrink-0 rounded-md bg-amber-500 px-9 py-3.5 text-sm font-bold tracking-wide text-slate-900 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            {t("submit")}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
