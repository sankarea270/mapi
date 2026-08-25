"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { climateForCategory } from "@/data/climate";
import { pickLocalized, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Tour } from "@/types/tour";

/**
 * Preguntas frecuentes del tour.
 *
 * Se construyen a partir de datos que ya están en la ficha —duración, precio,
 * qué incluye, altitud de la región, mejor época y la política de "sin pagos
 * en línea" que el sitio ya declara— en vez de escribirse a mano tour por
 * tour. Así cada tour tiene respuestas coherentes con lo que muestra arriba,
 * y no aparecen condiciones comerciales inventadas.
 *
 * El despliegue anima la altura real con grid-template-rows (ver .faq-body en
 * globals.css): no hay max-height fijado a ojo que corte las respuestas
 * largas.
 */

interface FaqItem {
  q: string;
  a: ReactNode;
}

interface TourFaqProps {
  tour: Tour;
  locale: string;
  /** Texto de la política de reserva, ya traducido por el llamador. */
  bookingPolicy: string;
}

export function TourFaq({ tour, locale, bookingPolicy }: TourFaqProps) {
  const t = useTranslations("faq");
  const ts = useTranslations("season");
  const l = locale as "es" | "en" | "pt";
  const [open, setOpen] = useState<number | null>(0);

  const region = climateForCategory(tour.categorySlug);
  const monthsLong = ts.raw("monthsLong") as string[];
  const price = formatPrice(tour.price, l, "USD");
  const bestMonths = region.best.map((i) => monthsLong[i]).join(" · ");

  const items: FaqItem[] = [
    {
      q: t("qSeason"),
      a: (
        <>
          <p className="font-semibold text-slate-900">{bestMonths}</p>
          <p className="mt-2">{pickLocalized(region.why, l)}</p>
        </>
      ),
    },
    {
      q: t("qDuration"),
      a: <p>{t("aDuration", { duration: pickLocalized(tour.duration, l) })}</p>,
    },
    {
      q: t("qIncluded"),
      a:
        tour.included && tour.included.length > 0 ? (
          <>
            <p>{t("aIncludedIntro", { price })}</p>
            <ul className="mt-3 space-y-1.5">
              {tour.included.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-teal-600">
                    —
                  </span>
                  <span>{pickLocalized(item, l)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>{t("aIncludedNone", { price })}</p>
        ),
    },
    {
      q: t("qGroup"),
      a: <p>{t("aGroup")}</p>,
    },
    {
      q: t("qBooking"),
      a: <p>{bookingPolicy}</p>,
    },
  ];

  /* La aclimatación solo tiene sentido donde de verdad hay altura. */
  if (region.altitude && region.altitude >= 2300) {
    items.splice(1, 0, {
      q: t("qAltitude"),
      a: <p>{t("aAltitude", { alt: region.altitude.toLocaleString(l) })}</p>,
    });
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-10">
      <p className="eyebrow text-amber-600">{t("badge")}</p>
      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-slate-900">
        {t("title")}
      </h2>

      <dl className="mt-7">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-slate-200">
              <dt>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-teal-700"
                >
                  <span className="font-heading text-[17px] font-bold leading-snug text-slate-900">
                    {item.q}
                  </span>
                  {/* Cruz que rota a "menos": una sola forma para los dos
                      estados, así el cambio se lee como un giro y no como un
                      icono que se sustituye por otro. */}
                  <span
                    aria-hidden="true"
                    className="relative mt-1.5 size-3.5 shrink-0 text-slate-400"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current" />
                    <span
                      className={cn(
                        "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-current transition-transform duration-300",
                        isOpen ? "scale-y-0 rotate-90" : "scale-y-100"
                      )}
                    />
                  </span>
                </button>
              </dt>
              <dd
                id={`faq-panel-${i}`}
                className="faq-body text-[15px] leading-relaxed text-slate-600"
                data-open={isOpen}
              >
                <div>
                  <div className="pb-6 pr-8">{item.a}</div>
                </div>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
