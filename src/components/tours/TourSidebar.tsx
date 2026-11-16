"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { redesConEnlace } from "@/config/ajustes";
import { useAjustes } from "@/components/providers/Ajustes";
import { pickLocalized } from "@/lib/format";
import { Price } from "@/components/ui/Price";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/layout/SocialIcons";
import { CabeceraPrecio, FormularioReserva, type Valoracion } from "./reserva/FormularioReserva";
import { useReserva } from "./reserva/useReserva";
import type { Tour } from "@/types/tour";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
} as const;

interface TourSidebarProps {
  tour: Tour;
  name: string;
  categoryName: string;
  locale: string;
  /** Media y número de reseñas propias del tour, si las tiene. */
  valoracion?: Valoracion;
}

/**
 * Panel de reserva de la ficha de tour.
 *
 * - En escritorio, una tarjeta que acompaña al scroll. Cabe en la pantalla
 *   (el formulario va en dos pasos) y, si la ventana es muy baja, el cuerpo
 *   se desplaza por dentro en vez de esconder el botón bajo el borde.
 * - En móvil y tableta, una barra fija abajo con el precio y «Reservar»,
 *   que abre el formulario en una hoja desde abajo. Antes el formulario
 *   estaba al final de toda la página y había que bajar hasta él.
 *
 * Las dos vistas comparten el mismo estado (`useReserva`): una sola reserva
 * en curso, se mire desde donde se mire.
 */
export function TourSidebar({ tour, name, locale, valoracion }: TourSidebarProps) {
  const t = useTranslations("tourDetail");
  const tr = useTranslations("reservaTour");
  const redes = redesConEnlace(useAjustes());
  const duracion = pickLocalized(tour.duration, locale as "es" | "en" | "pt");
  const r = useReserva({ slug: tour.slug, nombreTour: name, precio: tour.price, locale });
  const [hojaAbierta, setHojaAbierta] = useState(false);

  /* La barra fija ocupa el borde inferior en móvil. Se avisa a la página
     (atributo en <html>) para que el botón de contacto y el de «volver
     arriba» suban por encima y el pie no quede tapado. Ver globals.css. */
  useEffect(() => {
    document.documentElement.setAttribute("data-barra-reserva", "");
    return () => document.documentElement.removeAttribute("data-barra-reserva");
  }, []);

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--alto-cabecera,8.25rem)+1.25rem)] space-y-5 transition-[top] duration-300">
          <div
            id="reservar"
            className="flex max-h-[calc(100dvh_-_var(--alto-cabecera,8.25rem)_-_2.5rem)] scroll-mt-28 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_28px_60px_-30px_rgb(7_34_33/0.45)] ring-1 ring-slate-200/80"
          >
            <CabeceraPrecio precio={tour.price} locale={locale} duracion={duracion} valoracion={valoracion} />
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              <FormularioReserva r={r} nombreTour={name} locale={locale} />
            </div>
          </div>

          {redes.length > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4 ring-1 ring-slate-200">
              <p className="font-heading text-sm font-bold text-slate-900">{t("followUs")}</p>
              <div className="flex gap-1.5">
                {redes.map((social) => {
                  const Icon = socialIcons[social.red];
                  return (
                    <a
                      key={social.red}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.etiqueta}
                      className="grid size-9 place-items-center rounded-full text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-900 hover:text-white hover:ring-slate-900"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Móvil y tableta: barra fija + hoja. */}
      <DialogPrimitive.Root open={hojaAbierta} onOpenChange={setHojaAbierta}>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgb(7_34_33/0.35)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {tr("from")}
              </p>
              <Price amount={tour.price} locale={locale} size="md" suffix={tr("perPerson")} />
            </div>
            <DialogPrimitive.Trigger asChild>
              <button
                type="button"
                className="shrink-0 rounded-full bg-amber-500 px-7 py-3 text-[15px] font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                {r.paso === "enviado" ? tr("viewRequest") : tr("bookNow")}
              </button>
            </DialogPrimitive.Trigger>
          </div>
        </div>

        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none lg:hidden" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94dvh] max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom motion-reduce:animate-none lg:hidden"
          >
            <div className="relative">
              <span aria-hidden className="absolute left-1/2 top-2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40" />
              <DialogPrimitive.Title className="sr-only">{tr("sheetTitle", { name })}</DialogPrimitive.Title>
              <CabeceraPrecio precio={tour.price} locale={locale} duracion={duracion} valoracion={valoracion} compacta />
              <DialogPrimitive.Close
                aria-label={tr("close")}
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-5" aria-hidden />
              </DialogPrimitive.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-[env(safe-area-inset-bottom)]">
              <p className="px-6 pt-4 font-heading text-base font-bold leading-snug text-slate-900">{name}</p>
              <FormularioReserva r={r} nombreTour={name} locale={locale} />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
