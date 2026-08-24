"use client";

import { useState } from "react";
import { Clock, Star, Send, User, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { pickLocalized, formatPrice } from "@/lib/format";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/layout/SocialIcons";
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
}

export function TourSidebar({
  tour,
  name,
  categoryName,
  locale,
}: TourSidebarProps) {
  const t = useTranslations("tourDetail");
  const l = locale as "es" | "en" | "pt";
  const duration = pickLocalized(tour.duration, l);
  const [date, setDate] = useState("");
  const [tickets, setTickets] = useState(2);

  const whatsappLink = `https://wa.me/${siteConfig.phone.tel.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa el tour "${name}". ¿Tienen disponibilidad?`)}`;

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-400/10 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 size-24 rounded-full bg-amber-400/5 blur-xl" />

        <div className="relative">
          <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-300">
            {t("specialOffer")}
          </span>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-heading text-4xl font-extrabold tracking-tight">
              {formatPrice(tour.price, l, "USD")}
            </span>
            <span className="text-sm text-slate-400">/ persona</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Star className="size-4 fill-current text-amber-400" />
              <span className="font-medium">{tour.rating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">{t("excellent")}</span>
            </div>
            <span className="h-4 w-px bg-slate-600" />
            <div className="flex items-center gap-1.5 text-sm text-slate-300">
              <Clock className="size-3.5" />
              {duration}
            </div>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#25D366]/30"
          >
            <Send className="size-4" />
            {t("availability")}
          </a>
        </div>
      </div>

      <div
        id="reservar"
        className="scroll-mt-28 overflow-hidden rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 sm:p-7"
      >
        <h2 className="font-heading text-xl font-bold text-slate-900">
          {t("reserveSidebar")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {t("bookNowHint")}
        </p>
        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
              <input
                id="sidebar-name"
                type="text"
                placeholder="Tu nombre completo"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
              <input
                id="sidebar-email"
                type="email"
                placeholder="tu@correo.com"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </div>
          <DatePicker
            value={date}
            onChange={setDate}
            label="Fecha"
          />
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
              Entradas
            </label>
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5", "6+"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTickets(parseInt(num.replace("+", "")))}
                  className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all ${
                    tickets === parseInt(num.replace("+", "")) || (num === "6+" && tickets >= 6)
                      ? "bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
              Mensaje
            </label>
            <textarea
              id="sidebar-message"
              rows={3}
              placeholder="¿Algún detalle especial?"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <button
            type="button"
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-400/30"
          >
            <Send className="size-4" />
            {t("availability")}
          </button>
          <p className="text-center text-xs text-slate-400">
            Sin compromiso · Resposta en 24h
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 ring-1 ring-amber-100">
        <h2 className="font-heading text-lg font-bold text-slate-900">
          {t("followUs")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Síguenos para ver más destinos
        </p>
        <div className="mt-4 flex gap-2.5">
          {(Object.keys(socialIcons) as Array<keyof typeof socialIcons>).map(
            (key) => {
              const Icon = socialIcons[key];
              const social = siteConfig.socials[key];
              return (
                <a
                  key={key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid size-11 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:text-slate-900 hover:shadow-md hover:shadow-amber-400/20"
                >
                  <Icon className="size-4.5" />
                </a>
              );
            }
          )}
        </div>
      </div>
    </aside>
  );
}