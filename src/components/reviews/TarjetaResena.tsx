import Image from "next/image";
import { Star } from "lucide-react";
import type { Review } from "@/data/reviews";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import { cn } from "@/lib/utils";

export type FichaResena = { nombre: string; imagen: string; href: string };

/** Dos iniciales, saltándose lo que no es letra: "Carlos & Ana" da "CA". */
function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter((p) => /\p{L}/u.test(p[0] ?? ""))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/**
 * Una opinión, quieta: la de las fichas de tour.
 *
 * Es la misma tarjeta de la cinta del inicio —iniciales, nota, cita y el
 * viaje del que habla, con el llenado de color al pasar el ratón— para que
 * una reseña se reconozca igual en cualquier sitio. Cambian dos cosas: aquí
 * la cita va entera, porque quien llega a las reseñas de una ficha ha venido
 * a leerlas, y no hay botón de «leer más».
 */
export function TarjetaResena({
  review,
  locale,
  ficha,
}: {
  review: Review;
  locale: string;
  /** El viaje del que habla, si no es este mismo. */
  ficha?: FichaResena;
}) {
  const numero = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const estrellas = Math.floor(review.rating + 0.25);

  return (
    <figure className="resena flex flex-col rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/[0.05] transition-shadow duration-300 hover:shadow-xl hover:shadow-teal-900/15">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="resena-inicial grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 font-heading text-[15px] font-bold text-teal-800 transition-colors duration-300"
        >
          {iniciales(review.name)}
        </span>
        <figcaption className="min-w-0">
          <p className="resena-nombre truncate font-heading text-[14px] font-bold uppercase tracking-[0.08em] text-slate-900 transition-colors duration-300">
            {review.name}
          </p>
          {review.country && (
            <p className="resena-pais truncate text-[13px] text-slate-500 transition-colors duration-300">
              {review.country}
            </p>
          )}
        </figcaption>
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <div className="flex gap-0.5" role="img" aria-label={`${numero.format(review.rating)} / 5`}>
          {Array.from({ length: 5 }).map((_, e) => (
            <Star
              key={e}
              aria-hidden
              className={cn(
                "size-3.5 transition-colors duration-300",
                e < estrellas
                  ? "resena-estrella fill-current text-amber-500"
                  : "resena-estrella-vacia text-slate-200"
              )}
            />
          ))}
        </div>
        <span className="resena-nota font-heading text-[12px] font-bold tabular-nums text-slate-500 transition-colors duration-300">
          {numero.format(review.rating)}
        </span>
      </div>

      <blockquote className="resena-cita mt-2.5 flex-1 font-logo text-[16px] leading-[1.55] text-slate-600 transition-colors duration-300">
        &ldquo;{pickLocalized(review.text, locale)}&rdquo;
      </blockquote>

      {ficha && (
        <div className="mt-4">
          <Link
            href={ficha.href}
            className="resena-ficha group/f inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1 pr-3 transition-colors duration-300"
          >
            <Image
              src={ficha.imagen}
              alt=""
              width={48}
              height={48}
              sizes="24px"
              className="size-6 shrink-0 rounded-full object-cover"
            />
            <span className="resena-ficha-txt min-w-0 truncate font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600 transition-colors duration-300 group-hover/f:text-teal-700">
              {ficha.nombre}
            </span>
          </Link>
        </div>
      )}
    </figure>
  );
}
