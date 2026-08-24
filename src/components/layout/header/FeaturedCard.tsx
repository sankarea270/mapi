"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface FeaturedCardProps {
  image: string;
  title: string;
  href: string;
  cta: string;
  badge: string;
}

export function FeaturedCard({ image, title, href, cta, badge }: FeaturedCardProps) {
  return (
    <div className="group relative h-full min-h-[21rem] overflow-hidden rounded-2xl bg-slate-100">
      <Image
        src={image}
        alt={title}
        fill
        sizes="(min-width: 1280px) 300px, 260px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
          {badge}
        </span>
        <h3 className="mt-1.5 font-heading text-xl font-bold leading-snug text-white">{title}</h3>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-amber-300"
        >
          {cta}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
