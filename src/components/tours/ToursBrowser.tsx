"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Tour, TourCategory } from "@/types/tour";
import { pickLocalized, tourDurationBucket } from "@/lib/format";
import { normalize } from "@/lib/catalog";
import { TourCard } from "@/components/tours/TourCard";
import { FilterBar, type TourFilters } from "@/components/tours/FilterBar";
import { cn } from "@/lib/utils";

const PER_PAGE = 12;

/* El orden por defecto es el de la agencia (`recommended`), no el de mejor
   valorados: así se ve, por ejemplo, Machu Picchu en el orden correlativo
   que se fija en el panel. */
const ORDEN_DEFECTO = "recommended";

const EMPTY_FILTERS: TourFilters = {
  q: "",
  categoria: "",
  orden: ORDEN_DEFECTO,
  duracion: "",
  precio_max: "",
  rating_min: "",
};

function readFiltersFromUrl(search: string): TourFilters {
  const params = new URLSearchParams(search);
  return {
    q: params.get("q") ?? "",
    categoria: params.get("categoria") ?? "",
    orden: params.get("orden") ?? ORDEN_DEFECTO,
    duracion: params.get("duracion") ?? "",
    precio_max: params.get("precio_max") ?? "",
    rating_min: params.get("rating_min") ?? "",
  };
}

function toQueryString(filters: TourFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.orden && filters.orden !== ORDEN_DEFECTO) params.set("orden", filters.orden);
  if (filters.duracion) params.set("duracion", filters.duracion);
  if (filters.precio_max) params.set("precio_max", filters.precio_max);
  if (filters.rating_min) params.set("rating_min", filters.rating_min);
  if (page > 1) params.set("pagina", String(page));
  return params.toString();
}

/** Lo que se busca de cada tour, ya sin acentos y en minúsculas. */
interface TextoBuscable {
  nombre: string;
  categoria: string;
  ubicacion: string;
}

/**
 * Cuánto se parece un tour a lo buscado; 0 si falta alguna palabra.
 *
 * Pesa más que la palabra esté en el nombre que en la categoría: buscar
 * «cusco» pone primero el City Tour Cusco y después el resto de tours de la
 * categoría Cusco, en vez de mezclarlos.
 */
function puntuar(tour: TextoBuscable | undefined, terminos: string[]): number {
  if (!tour) return 0;
  let total = 0;
  for (const termino of terminos) {
    const enNombre = tour.nombre.indexOf(termino);
    if (enNombre !== -1) total += enNombre === 0 || tour.nombre[enNombre - 1] === " " ? 12 : 8;
    else if (tour.categoria.includes(termino)) total += 6;
    else if (tour.ubicacion.includes(termino)) total += 3;
    else return 0;
  }
  return total;
}

/** Desplazar sin animación si el visitante pidió reducir el movimiento. */
function irA(elemento: HTMLElement | null) {
  if (!elemento) return;
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  elemento.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
}

interface ToursBrowserProps {
  categories: TourCategory[];
  locale: string;
  fromLabel: string;
  /** Fondo para «Todos», configurado en Ajustes del panel. */
  fondoGeneral: string;
}

/**
 * El export estático no recibe searchParams en el servidor. Para que la lista
 * completa siga estando en el HTML generado (SEO + sin JS), este componente se
 * prerenderiza sin filtros y lee la query de la URL al montar en el navegador.
 * No usa useSearchParams a propósito: eso forzaría un bailout del prerender.
 *
 * La cabecera vive aquí y no en la página porque cambia con la categoría:
 * el fondo, el titular y el recuento. Antes era una franja blanca fija y, al
 * llegar desde el menú a «Machu Picchu», la página decía lo mismo que en
 * «Todos» y solo cambiaba una pastilla naranja entre diez.
 */
export function ToursBrowser({ categories, locale, fromLabel, fondoGeneral }: ToursBrowserProps) {
  const t = useTranslations("tours");
  const [filters, setFilters] = useState<TourFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  /* La URL solo se reescribe después de que el visitante toque algo. Al
     cargar ya es la buena, y reescribirla quitaría parámetros ajenos —los
     utm_… de una campaña— antes de que la analítica los lea. */
  const tocado = useRef(false);
  const filtrosRef = useRef<HTMLDivElement>(null);
  const resultadosRef = useRef<HTMLElement>(null);

  // Aplica la query de la URL una vez montado (y en back/forward).
  useEffect(() => {
    const sync = () => {
      setFilters(readFiltersFromUrl(window.location.search));
      setPage(Math.max(1, Number(new URLSearchParams(window.location.search).get("pagina")) || 1));
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  /* La URL sigue a los filtros con un respiro. La búsqueda filtra con cada
     letra, y Safari rechaza más de cien `replaceState` en treinta segundos:
     con una llamada por letra, escribir rápido llegaría a ese tope. */
  useEffect(() => {
    if (!tocado.current) return;
    const id = window.setTimeout(() => {
      const query = toQueryString(filters, page);
      if (query === window.location.search.replace(/^\?/, "")) return;
      window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
    }, 300);
    return () => window.clearTimeout(id);
  }, [filters, page]);

  /*
   * La lista empieza debajo de una cabecera de foto muy alta: en un portátil,
   * justo en el borde inferior de la pantalla. Al cambiar un filtro no se
   * veía moverse nada y la revisión de 2026 los dio por rotos («cualquier
   * precio no funciona»…). Ahora, si la lista no está a la vista, la barra
   * de filtros sube hasta arriba y se ven a la vez los filtros y los
   * primeros tours. Si ya se ve, no se mueve nada.
   */
  const mostrarResultados = useCallback(() => {
    const resultados = resultadosRef.current;
    if (!resultados || resultados.getBoundingClientRect().top < window.innerHeight * 0.7) return;
    irA(filtrosRef.current);
  }, []);

  const handleFiltersChange = useCallback(
    (patch: Partial<TourFilters>) => {
      tocado.current = true;
      setFilters((current) => ({ ...current, ...patch }));
      setPage(1);
      /* Ni la búsqueda —se mueve al dejar de escribir, abajo— ni la
         categoría, que ya cambia la foto y el titular de la cabecera. */
      if (!("q" in patch) && !("categoria" in patch)) mostrarResultados();
    },
    [mostrarResultados]
  );

  // Al dejar de escribir, si la lista no se ve, se trae a la vista.
  useEffect(() => {
    if (!tocado.current || !filters.q.trim()) return;
    const id = window.setTimeout(mostrarResultados, 700);
    return () => window.clearTimeout(id);
  }, [filters.q, mostrarResultados]);

  const allTours = useMemo(() => categories.flatMap((c) => c.tours), [categories]);

  /* Sobre qué se busca: el nombre en los tres idiomas —quien escribe
     «sacred valley» en la versión española también lo encuentra—, la
     categoría y la ubicación, sin acentos. Antes solo se miraba el nombre
     tal cual: «cusco» no encontraba los tours de la categoría Cusco que no
     lo llevan en el nombre, y «canon» no encontraba «Cañón del Colca». */
  const buscable = useMemo(() => {
    const categoria = new Map(
      categories.map((c) => [c.slug, normalize(`${c.name.es} ${c.name.en} ${c.name.pt}`)])
    );
    return new Map<string, TextoBuscable>(
      allTours.map((tour) => [
        tour.slug,
        {
          nombre: normalize(
            `${tour.name.es} ${tour.name.en} ${tour.name.pt} ${tour.slug.replace(/-/g, " ")}`
          ),
          categoria: categoria.get(tour.categorySlug) ?? "",
          ubicacion: tour.location ? normalize(pickLocalized(tour.location, locale)) : "",
        },
      ])
    );
  }, [allTours, categories, locale]);

  /*
   * Un fondo por categoría, y uno para «Todos».
   *
   * El de cada categoría es el que se sube en el panel; si no tiene —hoy
   * ninguna lo tiene—, la foto de su tour mejor valorado, que ya está
   * elegida con cuidado para su tarjeta. El de «Todos», el de Ajustes o, si
   * no hay, el del tour mejor valorado de todo el catálogo. Así ninguna
   * categoría se queda sin fondo mientras no se configure.
   */
  const fondos = useMemo(() => {
    const mejor = (tours: TourCategory["tours"]) =>
      [...tours].sort((a, b) => b.rating - a.rating).find((x) => x.image)?.image ?? "";
    const mapa: Record<string, string> = { "": fondoGeneral || mejor(allTours) };
    for (const c of categories) mapa[c.slug] = c.image || mejor(c.tours) || mapa[""];
    return mapa;
  }, [categories, allTours, fondoGeneral]);

  const categoriaActual = categories.find((c) => c.slug === filters.categoria);

  const sorted = useMemo(() => {
    const terminos = normalize(filters.q).split(/\s+/).filter(Boolean);
    const maxPrice = Number(filters.precio_max) || 0;
    const minRating = Number(filters.rating_min) || 0;
    const puntos = new Map<string, number>();

    const filtered = allTours.filter((tour: Tour) => {
      if (filters.categoria && tour.categorySlug !== filters.categoria) return false;
      if (filters.duracion && tourDurationBucket(tour) !== filters.duracion) return false;
      if (maxPrice && tour.price > maxPrice) return false;
      if (minRating && tour.rating < minRating) return false;
      if (terminos.length > 0) {
        const p = puntuar(buscable.get(tour.slug), terminos);
        if (p === 0) return false;
        puntos.set(tour.slug, p);
      }
      return true;
    });

    // `sort` es estable: a igualdad, se respeta el orden de la agencia.
    return filtered.sort((a, b) => {
      switch (filters.orden) {
        case "rating":
          return b.rating - a.rating;
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return pickLocalized(a.name, locale).localeCompare(pickLocalized(b.name, locale), locale);
        default:
          // Recomendados: el orden del catálogo; con búsqueda, lo que más se parece primero.
          return (puntos.get(b.slug) ?? 0) - (puntos.get(a.slug) ?? 0);
      }
    });
  }, [allTours, buscable, filters, locale]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    tocado.current = true;
    setPage(clamped);
    // Al principio de la lista, no de la página: arriba del todo solo está la foto.
    irA(resultadosRef.current);
  };

  const hayFiltros = Boolean(
    filters.q.trim() || filters.duracion || filters.precio_max || filters.rating_min
  );
  // Limpia los filtros pero se queda en la categoría elegida.
  const limpiar = () => handleFiltersChange({ ...EMPTY_FILTERS, categoria: filters.categoria });

  return (
    <>
      <section className="tours-portada relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden bg-slate-200 sm:min-h-[40rem] lg:min-h-[46rem]">
        {/* Todas las fotos a la vez, una encima de otra, y solo la activa
            visible. Cambiar la `src` de una sola imagen haría un parpadeo en
            blanco mientras carga la nueva; con las capas ya puestas el
            cambio es un fundido, y la de salida sigue ahí mientras entra la
            siguiente. */}
        {Object.entries(fondos).map(([slug, src]) =>
          src ? (
            <div
              key={slug || "todos"}
              aria-hidden
              className={cn(
                "tours-portada-capa absolute inset-0 -z-10 bg-cover bg-center",
                filters.categoria === slug && "tours-portada-capa--activa"
              )}
              style={{ backgroundImage: `url("${src}")` }}
            />
          ) : null
        )}
        {/* Sin velo: la foto se ve con sus colores. El texto lleva su propio
            contorno —el mismo de la portada— y los filtros van en cápsulas
            claras, así se lee sobre cualquier foto sin oscurecerla. */}
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-32">
          <p
            key={`c-${filters.categoria}`}
            className="tours-portada-texto portada-contorno-oscuro text-xs font-bold uppercase tracking-[0.22em] text-amber-400"
          >
            {/* El recuento de lo que se ve, con los filtros aplicados: es lo
                primero que cambia al filtrar, aunque la lista quede abajo. */}
            {t("found", { count: sorted.length })}
          </p>
          <h1
            key={`t-${filters.categoria}`}
            className="tours-portada-texto portada-contorno-claro mt-3 font-heading text-4xl font-bold uppercase leading-[0.95] text-teal-900 sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            {categoriaActual ? pickLocalized(categoriaActual.name, locale) : t("title")}
          </h1>
          <p className="portada-contorno-claro mt-4 max-w-2xl text-base font-semibold leading-relaxed text-teal-900 sm:text-lg">
            {t("subtitle")}
          </p>

          <div
            ref={filtrosRef}
            className="mt-8 scroll-mt-[calc(var(--alto-cabecera,8.25rem)+1rem)] sm:mt-10"
          >
            <FilterBar
              categories={categories}
              locale={locale}
              filters={filters}
              onChange={handleFiltersChange}
              onBuscar={() => irA(filtrosRef.current)}
              sobreFoto
            />
          </div>
        </div>
      </section>

      <section
        ref={resultadosRef}
        className="mx-auto max-w-7xl scroll-mt-[calc(var(--alto-cabecera,8.25rem)+1rem)] px-4 py-10 sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm font-medium text-slate-500" aria-live="polite">
            {t("results", { count: sorted.length })}
          </p>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-amber-700 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              <X className="size-3.5" aria-hidden />
              {t("reset")}
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-base text-slate-600">{t("empty")}</p>
            <button
              type="button"
              onClick={limpiar}
              className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              {t("reset")}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((tour) => {
              const category = categories.find((c) => c.slug === tour.categorySlug);
              return (
                <TourCard
                  key={tour.slug}
                  tour={tour}
                  categoryName={category ? pickLocalized(category.name, locale) : ""}
                  locale={locale}
                  fromLabel={fromLabel}
                />
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-4" aria-label={t("title")}>
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("prev")}
            </button>
            <span className="text-sm font-medium text-slate-500">
              {t("pageInfo", { current: currentPage, total: totalPages })}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("next")}
            </button>
          </nav>
        )}

        {/* Enlaces rastreables al resto del catálogo (no visibles) */}
        <div className="sr-only">
          {sorted.slice(PER_PAGE).map((tour) => (
            <Link key={tour.slug} href={`/tours/${tour.slug}`}>
              {pickLocalized(tour.name, locale)}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
