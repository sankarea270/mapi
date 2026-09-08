"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Review } from "@/data/reviews";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { pickLocalized } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Cuántas se enseñan a la vez. */
const POR_PAGINA = 3;
/** Cada cuánto pasa sola. Más largo que en el carrusel de tours: aquí hay
    que leer tres textos, no mirar tres fotos. */
const INTERVALO = 7000;

/*
 * Reseñas, con la maqueta de la referencia de ingamba.pro.
 *
 * Titular centrado a dos tintas, tres fichas blancas rectas con sombra
 * suave, y debajo una fila con dos botones redondos y una etiqueta en medio.
 *
 * Las reseñas llegan como propiedad, no importadas. Este componente es de
 * cliente —pagina y anima—, así que no puede consultar Supabase por sí
 * mismo: quien lo usa es un componente de servidor, que lee al compilar y
 * las pasa ya resueltas.
 *
 * Dos diferencias con la referencia, y las dos por una razón:
 *
 *  · No hay foto redonda dentro del titular. La referencia mete una; aquí no
 *    hay ninguna foto real del equipo o de viajeros que poner, y rellenarla
 *    con una de banco sería exactamente lo que se está intentando quitar del
 *    sitio.
 *
 *  · El texto del medio NO es un enlace. En la referencia dice "READ ALL
 *    REVIEWS" y lleva a una página de reseñas; aquí esa página no existe, y
 *    un enlace que no va a ninguna parte es peor que ninguno. En su lugar
 *    dice por dónde vas, que es información de verdad.
 */
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("reviews");
  /* El texto estaba fijado a `.es`: en inglés y portugués las reseñas salían
     en español aunque estuvieran traducidas en la base de datos. */
  const locale = useLocale();
  const reducido = useReducedMotion();
  const [pagina, setPagina] = useState(0);
  const [quieto, setQuieto] = useState(false);

  const paginas = Math.max(1, Math.ceil(reviews.length / POR_PAGINA));

  /* El resto se mantiene positivo a mano: en JavaScript (-1 % 2) es -1. */
  const ir = useCallback(
    (salto: number) => setPagina((p) => (p + salto + paginas * 10) % paginas),
    [paginas]
  );

  /* Pasa sola, y se para con el ratón encima: cambiar de página a media
     frase es la forma más rápida de que nadie termine de leer una reseña. */
  useEffect(() => {
    if (quieto || reducido || paginas < 2) return;
    const id = setInterval(() => ir(1), INTERVALO);
    return () => clearInterval(id);
  }, [quieto, reducido, paginas, ir]);

  if (reviews.length === 0) return null;

  const desde = pagina * POR_PAGINA;
  const visibles = reviews.slice(desde, desde + POR_PAGINA);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="escena-texto mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            {t("badge")}
          </p>
          {/* Dos tintas, como la referencia. El corte va en las traducciones
              y no calculado aquí: en español el acento cae en las dos últimas
              palabras y en inglés en las dos primeras, así que partir por
              posición habría coloreado lo que no era en algún idioma. */}
          <h2 className="mt-4 font-heading text-[2.2rem] font-bold uppercase leading-[0.95] text-slate-900 sm:text-[3.4rem]">
            {t("titlePlain")} <span className="text-teal-700">{t("titleAccent")}</span>
          </h2>
          <p className="mt-5 font-logo text-lg leading-relaxed text-slate-600 sm:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          onMouseEnter={() => setQuieto(true)}
          onMouseLeave={() => setQuieto(false)}
        >
          {visibles.map((review) => (
            <figure
              /* La `key` lleva la página: al cambiar, React remonta las tres
                 fichas y su animación de entrada se vuelve a ver. Con la
                 `key` solo en el id, cambiar de página mudaba el texto de
                 golpe dentro de las mismas cajas. */
              key={`${pagina}-${review.id}`}
              /* Sombra con las utilidades normales y no con un valor arbitrario:
                 `shadow-[0_2px_24px_rgba(...)]` no llegaba a generar regla y las
                 fichas salían planas —box-shadow vacío al medirlo—. */
              className="resena flex flex-col bg-white p-8 shadow-xl shadow-slate-900/10"
            >
              <figcaption>
                <p className="font-heading text-lg font-bold uppercase tracking-wide text-slate-900">
                  {review.name}
                </p>
                <p className="mt-1 font-logo text-[15px] text-teal-700">{review.country}</p>
              </figcaption>

              <blockquote className="mt-5 flex-1 font-logo text-lg leading-relaxed text-slate-700">
                &ldquo;{pickLocalized(review.text, locale)}&rdquo;
              </blockquote>

              {/* Las estrellas van en ámbar y no en el petróleo de la marca:
                  una estrella dorada se reconoce como valoración sin leer
                  nada, y cambiarle el color a eso solo genera dudas. */}
              <div
                className="mt-6 flex gap-1"
                role="img"
                aria-label={`${review.rating} / 5`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-[18px]",
                      index < Math.round(review.rating)
                        ? "fill-current text-amber-500"
                        : "text-slate-200"
                    )}
                  />
                ))}
              </div>
            </figure>
          ))}
        </div>

        {/* Los controles solo aparecen si hay más de una página: dos flechas
            que no llevan a ningún sitio son ruido. */}
        {paginas > 1 && (
          <div className="mt-14 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => ir(-1)}
              aria-label={t("prev")}
              className="grid size-12 place-items-center rounded-full bg-white text-slate-900 shadow-lg shadow-slate-900/15 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <ArrowLeft className="size-5" />
            </button>

            <p className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-slate-900 underline decoration-slate-900 decoration-2 underline-offset-8">
              {t("count", {
                from: desde + 1,
                to: Math.min(desde + POR_PAGINA, reviews.length),
                total: reviews.length,
              })}
            </p>

            <button
              type="button"
              onClick={() => ir(1)}
              aria-label={t("next")}
              className="grid size-12 place-items-center rounded-full bg-white text-slate-900 shadow-lg shadow-slate-900/15 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
