import Image from "next/image";
import { ArrowRight, Clock, Star } from "lucide-react";
import type { Tour } from "@/types/tour";
import { Link } from "@/i18n/navigation";
import { pickLocalized, formatPrice } from "@/lib/format";

interface TourCardProps {
  tour: Tour;
  categoryName: string;
  locale: string;
  fromLabel: string;
}

export function TourCard({ tour, categoryName, locale, fromLabel }: TourCardProps) {
  const name = pickLocalized(tour.name, locale);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={tour.image}
          alt={name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-teal-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {categoryName}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {tour.rating.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary">
          {name}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="size-3.5" />
          {pickLocalized(tour.duration, locale)}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="text-sm text-slate-400">
            {fromLabel}{" "}
            <span className="text-lg font-extrabold text-slate-900">
              {formatPrice(tour.price, locale, "USD")}
            </span>
          </p>
          <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}