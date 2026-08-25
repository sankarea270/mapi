"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { siteConfig, whatsappLink } from "@/config/site";
import { pickLocalized, formatPrice } from "@/lib/format";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/layout/SocialIcons";
import { cn } from "@/lib/utils";
import type { Tour } from "@/types/tour";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
} as const;

const TRAVELERS = [1, 2, 3, 4, 5, 6] as const;

interface TourSidebarProps {
  tour: Tour;
  name: string;
  categoryName: string;
  locale: string;
}

/**
 * Panel de reserva del tour, resuelto como un billete: cabecera oscura con
 * el precio, troquel perforado y cuerpo con el formulario. Se aleja del
 * patrón de tarjeta redondeada con orbe borroso detrás, que es lo que hace
 * que una página parezca generada.
 *
 * Antes los campos no tenían estado y el botón era un `type="button"` sin
 * manejador: el formulario no enviaba nada. Ahora valida y compone el
 * mensaje de WhatsApp, igual que el formulario de la página de reservas.
 */
export function TourSidebar({ tour, name, locale }: TourSidebarProps) {
  const t = useTranslations("tourDetail");
  const tr = useTranslations("reserva");
  const l = locale as "es" | "en" | "pt";
  const duration = pickLocalized(tour.duration, l);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    date: "",
    travelers: 2,
    message: "",
  });
  const [touched, setTouched] = useState(false);

  const errors = {
    fullName: form.fullName.trim().length < 2 ? tr("errors.fullName") : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "" : tr("errors.email"),
    date: form.date ? "" : tr("errors.date"),
  };
  const isValid = !errors.fullName && !errors.email && !errors.date;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    const lines = [
      `${tr("title")}: ${name}`,
      `${tr("date")}: ${form.date}`,
      `${tr("travelers")}: ${form.travelers}`,
      `${tr("fullName")}: ${form.fullName}`,
      `${tr("email")}: ${form.email}`,
      form.message ? `${tr("message")}: ${form.message}` : "",
    ].filter(Boolean);
    window.open(whatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  const field =
    "w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-300 outline-none transition-colors focus:border-teal-500";

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div
        id="reservar"
        className="ticket-notch scroll-mt-28 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200"
        style={{ ["--notch" as string]: "#f4f8f9", ["--notch-y" as string]: "168px" }}
      >
        {/* Cabecera: el precio manda, en cifra grande y sin adornos. */}
        <div className="bg-slate-900 px-6 pb-6 pt-5 text-white">
          <p className="eyebrow text-teal-300">{t("specialOffer")}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-[2.6rem] font-bold leading-none tracking-tight">
                {formatPrice(tour.price, l, "USD")}
              </span>
              <span className="text-sm text-slate-300">/ {tr("travelers").toLowerCase()}</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-5 border-t border-white/15 pt-4 text-sm">
            <span className="text-slate-300">
              <span className="text-white">{tour.rating.toFixed(1)}</span> / 5
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-slate-300">{duration}</span>
          </div>
        </div>

        <div className="perforation" />

        <form onSubmit={submit} noValidate className="px-6 pb-6 pt-6">
          <h2 className="font-heading text-lg font-bold text-slate-900">
            {t("reserveSidebar")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            {t("bookNowHint")}
          </p>

          <div className="mt-7 space-y-6">
            <div>
              <label htmlFor="sb-name" className="eyebrow text-slate-400">
                {tr("fullName")}
              </label>
              <input
                id="sb-name"
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder={tr("fullNamePlaceholder")}
                className={cn(field, touched && errors.fullName && "border-red-400")}
              />
              {touched && errors.fullName && (
                <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="sb-email" className="eyebrow text-slate-400">
                {tr("email")}
              </label>
              <input
                id="sb-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder={tr("emailPlaceholder")}
                className={cn(field, touched && errors.email && "border-red-400")}
              />
              {touched && errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <DatePicker
              value={form.date}
              onChange={(d) => set("date", d)}
              label={tr("date")}
            />
            {touched && errors.date && (
              <p className="-mt-4 text-xs text-red-600">{errors.date}</p>
            )}

            <div>
              <span className="eyebrow text-slate-400">{tr("travelers")}</span>
              {/* Segmentado con filete, en vez de seis botones sueltos. */}
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

            <div>
              <label htmlFor="sb-msg" className="eyebrow text-slate-400">
                {tr("message")}
              </label>
              <textarea
                id="sb-msg"
                rows={2}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder={tr("messagePlaceholder")}
                className={cn(field, "resize-none")}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-amber-500 py-3.5 text-sm font-bold tracking-wide text-slate-900 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              {tr("whatsappConfirm")}
            </button>
            <p className="text-center text-xs leading-relaxed text-slate-400">
              {tr("noPayment")}
            </p>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 px-6 py-5">
        <h2 className="font-heading text-base font-bold text-slate-900">
          {t("followUs")}
        </h2>
        <div className="mt-4 flex gap-2">
          {(Object.keys(socialIcons) as Array<keyof typeof socialIcons>).map((key) => {
            const Icon = socialIcons[key];
            const social = siteConfig.socials[key];
            return (
              <a
                key={key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="grid size-10 place-items-center rounded-md text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-900 hover:text-white hover:ring-slate-900"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
