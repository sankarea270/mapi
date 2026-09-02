"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Review } from "@/data/reviews";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/*
 * Las reseñas llegan como propiedad, no importadas.
 *
 * Este componente es de cliente —anima al entrar en pantalla—, así que no
 * puede consultar Supabase por sí mismo. Quien lo usa es un componente de
 * servidor: allí se leen los datos al compilar y se pasan ya resueltos.
 */
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("reviews");
  const reduced = useReducedMotion();
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-2xl text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {t("badge")}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <figure
              key={review.id}
              className={`flex flex-col rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100 transition-all hover:shadow-lg hover:ring-amber-100 scroll-animate ${
                isVisible && !reduced ? `animate-fade-in-up delay-${Math.min((i % 3) + 1, 3) * 100}` : ""
              }`}
            >
              <div className="flex gap-1" role="img" aria-label={`${review.rating} / 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${
                      index < Math.round(review.rating)
                        ? "fill-current text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                &ldquo;{review.text.es}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {review.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.country}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
