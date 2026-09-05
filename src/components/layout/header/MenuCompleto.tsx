"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronRight, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/config/navigation";
import { whatsappLink, socials, siteConfig, siteEmail } from "@/config/site";
import type { CategoryBrief } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/layout/SocialIcons";

/** Una entrada de la columna del centro. */
interface Entrada {
  etiqueta: string;
  href: string;
  imagen?: string;
}

/* Los iconos de marca del propio proyecto, los mismos que el pie. lucide
   ya no exporta logos de terceros, y dibujarlos otra vez aquí sería tener
   dos TikTok distintos que se separarían con el tiempo. */
const ICONO_SOCIAL = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
} as const;

/**
 * Menú a pantalla completa, calcado de la referencia de ingamba.pro.
 *
 * Tres columnas: secciones, contenido de la sección señalada, y foto de lo
 * señalado. Se navega con el ratón sin pulsar nada.
 *
 * Lo que se copia de la referencia, punto por punto, porque la versión
 * anterior se desviaba en todo esto:
 *
 *  · Las dos primeras columnas van en CREMA, no en oscuro, y con la segunda
 *    un tono más cálida que la primera. El panel oscuro que había antes
 *    cambiaba por completo el peso visual del menú.
 *  · Tipografía CONDENSADA en versales. La de titulares del sitio es Syne,
 *    una geométrica ancha: en una columna de 335px no cabe con este cuerpo.
 *  · Lista plana, sin subtítulos de grupo y sin contadores, terminada en
 *    "VER TODOS" como una entrada más de la lista.
 *  · La entrada señalada se marca con un bloque teñido a todo el ancho de la
 *    columna, el texto en el color de marca y una flecha a la derecha.
 *  · El rótulo de la foto va ARRIBA a la izquierda, con un "EXPLORAR"
 *    subrayado debajo, y sin el degradado que tapaba el pie de la imagen.
 *
 * El color: donde la referencia usa su rojo, aquí va el petróleo de la
 * marca. El ámbar del logotipo queda descartado a propósito para esto —
 * ámbar sobre crema da un contraste de 1.9:1, ilegible; el petróleo da
 * 5.4:1. No es una preferencia estética.
 *
 * Dos decisiones que no se ven pero deciden si esto es usable: al abrirse se
 * bloquea el scroll del cuerpo (si no, la rueda mueve la página de detrás y
 * al cerrar apareces en otro sitio), y Escape cierra (un panel a pantalla
 * completa sin salida por teclado es una trampa para quien no usa ratón).
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

  // Se recalcula solo si cambia el catálogo o el idioma: recorrer NAV_ITEMS
  // en cada movimiento del ratón sería trabajo repetido en un panel que ya
  // está cambiando una foto.
  const secciones = useMemo(() => {
    const desdeNav = NAV_ITEMS.map((item) => {
      const etiqueta = t(item.labelKey);

      if (item.kind === "tours") {
        return {
          etiqueta,
          href: item.href,
          entradas: catalog.map((c) => ({
            etiqueta: c.name,
            href: `/tours?categoria=${c.slug}`,
            imagen: c.tours[0]?.image,
          })),
        };
      }

      if (item.kind === "category") {
        const categoria = catalog.find((c) => c.slug === item.categorySlug);
        return {
          etiqueta,
          href: `/tours?categoria=${item.categorySlug}`,
          entradas: (categoria?.tours ?? []).map((tour) => ({
            etiqueta: tour.name,
            href: `/tours/${tour.slug}`,
            imagen: tour.image,
          })),
        };
      }

      return {
        etiqueta,
        href: item.href,
        // Plano, como la referencia: los títulos de grupo partían la lista en
        // tres trozos cortos y hacían que la columna se leyera como un índice
        // y no como un menú.
        entradas: item.sections.flatMap((s) =>
          s.links.map((l) => ({
            etiqueta: t(l.labelKey),
            href: l.href,
            imagen: item.featured?.image,
          }))
        ),
      };
    });

    // Nosotros y Contacto no están en NAV_ITEMS porque en la barra en línea
    // vivían en el pie. En un menú a pantalla completa sí tienen sitio.
    return [
      ...desdeNav,
      { etiqueta: t("nav.about"), href: "/nosotros", entradas: [] as Entrada[] },
      { etiqueta: t("nav.contact"), href: "/contacto", entradas: [] as Entrada[] },
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
  const foto = destacado ?? actual.entradas[0];
  const imagen = foto?.imagen ?? catalog[0]?.tours[0]?.image;
  const cerrar = () => onOpenChange(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex font-condensada animate-in fade-in-0 duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menu")}
    >
      {/* ─── Columna 1: secciones ─────────────────────────────────────── */}
      <div className="flex w-full shrink-0 flex-col overflow-y-auto bg-[#faf8f4] px-8 py-8 sm:w-[19rem] lg:w-[21rem] lg:px-9 lg:py-9">
        <Link href="/" onClick={cerrar} className="font-logo text-3xl font-medium text-slate-900">
          {siteConfig.name}
          <span className="text-amber-600">{siteConfig.nameSuffix}</span>
        </Link>

        <nav className="mt-10 flex-1">
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
                    "flex items-center justify-between gap-3 py-[0.82rem] text-[1.4rem] font-bold uppercase leading-none tracking-[0.01em] transition-colors outline-none",
                    i === seccion
                      ? "text-teal-700"
                      : "text-slate-900 hover:text-teal-700 focus-visible:text-teal-700"
                  )}
                >
                  {s.etiqueta}
                  {/* La flecha solo donde hay algo dentro: en la referencia
                      es lo que distingue una sección con submenú de un
                      enlace suelto. */}
                  {s.entradas.length > 0 && (
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        i === seccion ? "text-teal-700" : "text-slate-400"
                      )}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 border-t border-slate-300/70 pt-6">
          <a
            href={`tel:${siteConfig.phone.tel}`}
            className="block py-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500 transition-colors hover:text-teal-700"
          >
            {siteConfig.phone.display}
          </a>
          <a
            href={`mailto:${siteEmail}`}
            className="block py-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500 transition-colors hover:text-teal-700"
          >
            {siteEmail}
          </a>

          {/* Iconos de verdad y no las siglas del nombre: en la referencia
              son glifos, y "FA / IN / YO" no se entiende. */}
          <div className="mt-6 flex gap-4">
            {(Object.keys(ICONO_SOCIAL) as Array<keyof typeof ICONO_SOCIAL>).map((clave) => {
              const Icono = ICONO_SOCIAL[clave];
              const s = socials[clave];
              return (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-slate-500 transition-colors hover:text-teal-700"
                >
                  <Icono className="size-[18px]" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Columna 2: contenido de la sección ───────────────────────── */}
      <div className="menu-curvas hidden w-[18rem] shrink-0 flex-col overflow-y-auto bg-[#f3eee4] px-6 py-9 sm:flex lg:w-[20rem]">
        <p className="px-4 text-[13px] font-bold uppercase tracking-[0.16em] text-teal-700">
          {actual.etiqueta}
        </p>

        <ul className="mt-5 flex-1">
          {actual.entradas.map((e) => {
            const activa = foto?.href === e.href;
            return (
              <li key={e.href + e.etiqueta}>
                <Link
                  href={e.href}
                  onMouseEnter={() => setDestacado(e)}
                  onFocus={() => setDestacado(e)}
                  onClick={cerrar}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-4 text-[1.06rem] font-semibold uppercase leading-tight tracking-[0.01em] transition-colors outline-none",
                    activa ? "bg-teal-700/[0.09] text-teal-700" : "text-slate-800 hover:text-teal-700"
                  )}
                >
                  {e.etiqueta}
                  {activa && <ArrowRight className="size-4 shrink-0" />}
                </Link>
              </li>
            );
          })}

          {/* "Ver todos" es una entrada más de la lista, como el "VIEW ALL"
              de la referencia, y no un botón aparte al pie de la columna. */}
          <li>
            <Link
              href={actual.href}
              onClick={cerrar}
              className="flex items-center justify-between gap-3 px-4 py-4 text-[1.06rem] font-semibold uppercase leading-tight tracking-[0.01em] text-slate-800 transition-colors hover:text-teal-700"
            >
              {t("nav.viewAll")}
            </Link>
          </li>
        </ul>
      </div>

      {/* ─── Columna 3: foto ──────────────────────────────────────────── */}
      <div className="relative hidden flex-1 bg-slate-900 lg:block">
        {imagen && (
          /* La `key` fuerza un nodo nuevo por foto: sin ella React reutiliza
             el mismo <img> y la entrada no vuelve a dispararse al pasar de
             una entrada a otra. */
          <Image
            key={imagen}
            src={imagen}
            alt=""
            fill
            sizes="45vw"
            className="animate-in fade-in-0 object-cover duration-500"
          />
        )}

        {/* Rótulo arriba a la izquierda, como la referencia. La sombra
            sustituye al degradado: un degradado a toda la anchura tapaba
            media foto para sostener dos renglones de texto. */}
        <div className="absolute left-10 top-9 max-w-md">
          <p className="text-[2.1rem] font-bold uppercase leading-none tracking-[0.01em] text-white [text-shadow:0_2px_14px_rgba(2,6,23,0.55)]">
            {foto?.etiqueta ?? actual.etiqueta}
          </p>
          <Link
            href={foto?.href ?? actual.href}
            onClick={cerrar}
            className="mt-3 inline-block border-b-2 border-teal-400 pb-1 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white [text-shadow:0_1px_8px_rgba(2,6,23,0.6)]"
          >
            {t("nav.explore")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ─── Acciones ─────────────────────────────────────────────────── */}
      <div className="absolute right-6 top-7 flex items-center gap-4">
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden bg-teal-700 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-teal-800 sm:inline-flex"
        >
          {t("nav.contact")}
        </a>
        <button
          type="button"
          onClick={cerrar}
          aria-label={t("nav.close")}
          /* Sin recuadro, como la referencia. Oscuro mientras la aspa cae
             sobre la crema, y blanco a partir de `lg`, que es cuando hay
             foto debajo. */
          className="text-slate-900 transition-opacity hover:opacity-60 lg:text-white"
        >
          <X className="size-8" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
