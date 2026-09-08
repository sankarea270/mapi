"use client";

import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

interface NavBarProps {
  transparent: boolean;
  onOpenSearch: () => void;
  onOpenMobile: () => void;
}

/**
 * Cabecera: menú a la izquierda, logotipo en el centro, acciones a la
 * derecha. Todo con esquinas rectas.
 *
 * Ya no hay navegación en línea con desplegables. Se quitó por una razón
 * medible, no de gusto: con las siete secciones desplegadas, esa navegación
 * ocupaba 905px de los 1280 de la ventana, así que la columna izquierda
 * empujaba al logotipo y este acababa a 102px de ancho, descentrado. Con
 * `1fr auto 1fr` no basta —`1fr` cede ante el contenido— y forzar el ancho
 * habría dejado los siete enlaces apretados o cortados.
 *
 * La referencia resuelve lo mismo del mismo modo: una sola entrada "MENÚ"
 * que abre el panel a pantalla completa, donde las secciones caben con
 * holgura y encima acompañadas de su foto.
 */
export function NavBar({ transparent, onOpenSearch, onOpenMobile }: NavBarProps) {
  const t = useTranslations();
  const light = transparent;

  return (
    <div
      className={cn(
        "relative w-full transition-colors duration-300",
        light
          ? "bg-gradient-to-b from-slate-950/60 via-slate-950/25 to-transparent"
          : "bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur"
      )}
    >
      {/* Tres zonas de igual peso: con `minmax(0,1fr)` las laterales no
          pueden crecer más allá de su parte, así que el logotipo queda
          centrado respecto a la página pase lo que pase con el contenido. */}
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4 sm:px-6 lg:h-24">
        <div className="justify-self-start">
          <button
            type="button"
            onClick={onOpenMobile}
            className={cn(
              "flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
              light
                ? "text-white [text-shadow:0_1px_3px_rgba(2,6,23,0.6)] hover:text-amber-300"
                : "text-slate-700 hover:text-teal-700"
            )}
          >
            <Menu className="size-5" />
            {t("nav.menu")}
          </button>
        </div>

        <div className="justify-self-center">
          <Logo light={light} centrado />
        </div>

        <div className="flex items-center justify-self-end gap-2 sm:gap-3">
          {/* El mismo aro del buscador, en pequeño: la lupa es lo que lo
              abre, así que comparten señal. */}
          <span className="aro-animado rounded-full">
            <span className="aro-capa" aria-hidden />
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label={t("nav.search")}
              className={cn(
                "relative grid size-10 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
                /* Fondo también sobre la portada, aunque ahí la cabecera
                   sea transparente: es lo que tapa el centro del aro. Sin
                   él, el degradado se vería por todo el botón en vez de
                   solo por el borde. Translúcido y desenfocado para que la
                   foto siga leyéndose por detrás. */
                light
                  ? "bg-slate-950/35 text-white backdrop-blur-sm hover:text-amber-300"
                  : "bg-white text-slate-700 hover:text-teal-700"
              )}
            >
              <Search className="size-5" />
            </button>
          </span>

          {/* `Reservar` lleva el aro y `Planifica` no: uno es el botón
              macizo de la marca y el otro el discreto. Ponérselo a los dos
              dejaría dos cosas compitiendo por la misma atención. */}
          <span className="aro-animado hidden lg:inline-flex">
            <span className="aro-capa" aria-hidden />
            <Link
              href="/reservar"
              className={cn(
                "relative inline-flex px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors",
                light
                  ? "bg-slate-950/35 text-white backdrop-blur-sm hover:text-amber-300"
                  : "bg-white text-slate-700 hover:text-teal-700"
              )}
            >
              {t("nav.reserve")}
            </Link>
          </span>

          <Link
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden bg-teal-600 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-teal-700 sm:inline-flex"
          >
            {t("nav.plan")}
          </Link>
        </div>
      </div>
    </div>
  );
}
