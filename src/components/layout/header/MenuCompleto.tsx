"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/config/navigation";
import { whatsappLink, socials, siteConfig, siteEmail } from "@/config/site";
import type { CategoryBrief } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Una entrada de la columna del centro. */
interface Entrada {
  etiqueta: string;
  href: string;
  imagen?: string;
  /** Solo en categorías del catálogo: cuántos tours hay dentro. */
  cuenta?: number;
}

/** Un bloque con título dentro de la columna del centro. */
interface Bloque {
  titulo?: string;
  entradas: Entrada[];
}

/**
 * Menú a pantalla completa, en tres columnas.
 *
 * Sigue la referencia de ingamba.pro: a la izquierda las secciones del sitio,
 * en el centro lo que hay dentro de la sección señalada, y a la derecha una
 * foto de aquello sobre lo que está el ratón. Se navega sin pulsar nada.
 *
 * El contenido sale de `NAV_ITEMS` y del catálogo, no de una lista escrita
 * aquí. Eso importa: la lista a mano dejaba seis de las siete secciones con
 * un único "Ver todos" —un menú a pantalla completa casi vacío— y encima
 * habría que acordarse de tocar dos sitios cada vez que cambie la navegación.
 *
 * Tres decisiones que no se ven pero deciden si esto es usable:
 *
 *  · Al abrirse se bloquea el scroll del cuerpo. Sin eso, la rueda mueve la
 *    página de detrás mientras el menú la tapa, y al cerrar apareces en otro
 *    sitio sin saber por qué.
 *
 *  · Escape cierra. Es lo primero que intenta quien navega con teclado, y un
 *    panel a pantalla completa sin salida es una trampa para quien no usa
 *    ratón.
 *
 *  · Cada sección responde también a `onFocus`, no solo a `onMouseEnter`: al
 *    tabular por la columna izquierda la del centro cambia igual.
 *
 * La columna de la foto se oculta por debajo de `lg`: en un móvil no cabe, y
 * meterla obligaría a encoger las otras dos hasta hacerlas ilegibles.
 */
export function MenuCompleto({
  open,
  onOpenChange,
  catalog,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  catalog: CategoryBrief[];
}) {
  const t = useTranslations();
  const [seccion, setSeccion] = useState(0);
  const [destacado, setDestacado] = useState<Entrada | null>(null);

  // Se recalcula solo si cambia el catálogo o el idioma; recorrer NAV_ITEMS
  // en cada movimiento del ratón sería trabajo repetido en un panel que ya
  // está animando una foto.
  const secciones = useMemo(() => {
    const desdeNav = NAV_ITEMS.map((item) => {
      const etiqueta = t(item.labelKey);

      if (item.kind === "tours") {
        return {
          etiqueta,
          href: item.href,
          bloques: [
            {
              entradas: catalog.map((c) => ({
                etiqueta: c.name,
                href: `/tours?categoria=${c.slug}`,
                imagen: c.tours[0]?.image,
                cuenta: c.tours.length,
              })),
            },
          ] as Bloque[],
        };
      }

      if (item.kind === "category") {
        const categoria = catalog.find((c) => c.slug === item.categorySlug);
        return {
          etiqueta,
          href: `/tours?categoria=${item.categorySlug}`,
          bloques: [
            {
              entradas: (categoria?.tours ?? []).map((tour) => ({
                etiqueta: tour.name,
                href: `/tours/${tour.slug}`,
                imagen: tour.image,
              })),
            },
          ] as Bloque[],
        };
      }

      return {
        etiqueta,
        href: item.href,
        bloques: item.sections.map((s) => ({
          titulo: t(s.titleKey),
          entradas: s.links.map((l) => ({
            etiqueta: t(l.labelKey),
            href: l.href,
            imagen: item.featured?.image,
          })),
        })) as Bloque[],
      };
    });

    // Nosotros y Contacto no están en NAV_ITEMS porque en la barra en línea
    // vivían en el pie. En un menú a pantalla completa sí tienen sitio.
    return [
      ...desdeNav,
      { etiqueta: t("nav.about"), href: "/nosotros", bloques: [] as Bloque[] },
      { etiqueta: t("nav.contact"), href: "/contacto", bloques: [] as Bloque[] },
    ];
  }, [catalog, t]);

  useEffect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", alPulsar);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", alPulsar);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const actual = secciones[seccion] ?? secciones[0];
  const primera = actual.bloques[0]?.entradas[0];
  const foto = destacado ?? primera;
  const imagen = foto?.imagen ?? catalog[0]?.tours[0]?.image;

  const cerrar = () => onOpenChange(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-in fade-in-0 duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menu")}
    >
      {/* Columna 1: secciones del sitio */}
      <div className="flex w-full shrink-0 flex-col overflow-y-auto bg-slate-950 px-7 py-8 sm:w-72 lg:w-80 lg:px-10 lg:py-10">
        <p className="font-logo text-2xl font-medium text-white">
          {siteConfig.name}
          <span className="text-amber-500">{siteConfig.nameSuffix}</span>
        </p>

        <nav className="mt-9 flex-1">
          <ul>
            {secciones.map((s, i) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  onMouseEnter={() => {
                    setSeccion(i);
                    setDestacado(null);
                  }}
                  onFocus={() => {
                    setSeccion(i);
                    setDestacado(null);
                  }}
                  onClick={cerrar}
                  className={cn(
                    "block py-2 text-lg font-bold uppercase tracking-wide transition-colors outline-none focus-visible:text-amber-400 sm:text-xl",
                    i === seccion ? "text-amber-500" : "text-white/65 hover:text-white"
                  )}
                >
                  {s.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 space-y-3 border-t border-white/10 pt-7">
          <a
            href={`tel:${siteConfig.phone.tel}`}
            className="block text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          >
            {siteConfig.phone.display}
          </a>
          <a
            href={`mailto:${siteEmail}`}
            className="block text-xs uppercase tracking-widest text-white/40 transition-colors hover:text-white"
          >
            {siteEmail}
          </a>
          <div className="flex gap-4 pt-1">
            {Object.values(socials).map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-white/40 transition-colors hover:text-amber-500"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Columna 2: lo que hay dentro de la sección señalada */}
      <div className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-slate-100 px-7 py-10 sm:flex lg:w-[23rem] lg:px-9">
        <p className="eyebrow text-slate-400">{actual.etiqueta}</p>

        <div className="mt-6 flex-1 space-y-7">
          {actual.bloques.length > 0 ? (
            actual.bloques.map((bloque, b) => (
              <div key={bloque.titulo ?? b}>
                {bloque.titulo && (
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {bloque.titulo}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {bloque.entradas.map((e) => (
                    <li key={e.href + e.etiqueta}>
                      <Link
                        href={e.href}
                        onMouseEnter={() => setDestacado(e)}
                        onFocus={() => setDestacado(e)}
                        onClick={cerrar}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors outline-none hover:bg-white hover:text-slate-900 focus-visible:bg-white focus-visible:text-slate-900"
                      >
                        {e.etiqueta}
                        {e.cuenta !== undefined && (
                          <span className="shrink-0 text-xs text-slate-300">{e.cuenta}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <Link
              href={actual.href}
              onClick={cerrar}
              className="block px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            >
              {t("nav.viewAll")}
            </Link>
          )}
        </div>

        <Link
          href={actual.href}
          onClick={cerrar}
          className="mt-8 block bg-teal-600 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-teal-700"
        >
          {t("nav.viewAll")}
        </Link>
      </div>

      {/* Columna 3: foto de lo señalado */}
      <div className="relative hidden flex-1 bg-slate-900 lg:block">
        {imagen && (
          /* La `key` fuerza un nodo nuevo por foto: sin ella React reutiliza
             el mismo <img> y la animación de entrada no vuelve a dispararse
             al pasar de una entrada a otra. */
          <Image
            key={imagen}
            src={imagen}
            alt=""
            fill
            sizes="45vw"
            className="animate-in fade-in-0 zoom-in-105 object-cover duration-700"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-10">
          <p className="font-heading text-3xl font-bold uppercase tracking-tight text-white">
            {foto?.etiqueta ?? actual.etiqueta}
          </p>
        </div>
      </div>

      <div className="absolute right-5 top-5 flex items-center gap-3">
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden bg-white/10 px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/20 lg:inline-flex"
        >
          {t("nav.plan")}
        </a>
        <button
          type="button"
          onClick={cerrar}
          aria-label={t("nav.close")}
          className="grid size-12 place-items-center bg-teal-600 text-white transition-colors hover:bg-teal-700"
        >
          <X className="size-6" />
        </button>
      </div>
    </div>
  );
}
