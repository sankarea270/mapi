"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TourCategory } from "@/types/tour";
import { NAV_ITEMS } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { NavPanel } from "./NavPanel";

const CLOSE_DELAY_MS = 160;

interface NavBarProps {
  categories: TourCategory[];
  transparent: boolean;
  onOpenSearch: () => void;
  onOpenMobile: () => void;
}

export function NavBar({ categories, transparent, onOpenSearch, onOpenMobile }: NavBarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const [open, setOpen] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), CLOSE_DELAY_MS);
  };

  const light = transparent;

  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  useEffect(() => {
    if (open === null) return;

    const onPointerDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  const isActive = (i: number) => open === i;

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative w-full transition-colors duration-300",
        transparent
          ? "bg-gradient-to-b from-slate-950/60 via-slate-950/25 to-transparent"
          : "bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
        <Logo light={light} compact={false} />

        <nav aria-label={t("nav.navLabel")} className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.labelKey} className="relative">
                <button
                  type="button"
                  aria-expanded={isActive(i)}
                  aria-haspopup="menu"
                  onMouseEnter={() => {
                    cancelClose();
                    setOpen(i);
                  }}
                  onMouseLeave={scheduleClose}
                  onFocus={() => {
                    cancelClose();
                    setOpen(i);
                  }}
                  onClick={() => setOpen(isActive(i) ? null : i)}
                  className={cn(
                    "group relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
                    light
                      ? "text-white [text-shadow:0_1px_3px_rgba(2,6,23,0.6)] hover:bg-white/15"
                      : "text-slate-700 hover:bg-slate-100 hover:text-primary",
                    isActive(i) && (light ? "bg-white/15 text-amber-300" : "bg-slate-100 text-primary")
                  )}
                >
                  {t(item.labelKey)}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      light && "text-amber-300",
                      isActive(i) && "rotate-180"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-amber-400 transition-all duration-200",
                      isActive(i) ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={t("nav.search")}
            className={cn(
              "grid size-10 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
              light
                ? "text-white [text-shadow:0_1px_3px_rgba(2,6,23,0.6)] hover:bg-white/15"
                : "text-slate-700 hover:bg-slate-100 hover:text-primary"
            )}
          >
            <Search className="size-5" />
          </button>

          <Link
            href="/reservar"
            className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-amber-500 hover:text-amber-700 md:inline-flex"
          >
            {t("nav.reserve")}
          </Link>

          <Link
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/20 transition-colors hover:bg-amber-300 md:inline-flex"
          >
            {t("nav.plan")}
          </Link>

          <button
            type="button"
            onClick={onOpenMobile}
            aria-label={t("nav.menu")}
            className={cn(
              "grid size-10 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 xl:hidden",
              light
                ? "text-white [text-shadow:0_1px_3px_rgba(2,6,23,0.6)] hover:bg-white/15"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {open !== null && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute inset-x-0 top-full hidden border-t border-slate-100 bg-white shadow-2xl shadow-slate-900/10 animate-in fade-in-0 slide-in-from-top-2 duration-200 xl:block"
        >
          <NavPanel item={NAV_ITEMS[open]} categories={categories} />
        </div>
      )}
    </div>
  );
}
