"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { NavBar } from "./NavBar";
import { MobileMenu } from "./MobileMenu";
import { SearchDialog } from "./SearchDialog";
import type { CategoryBrief } from "@/lib/catalog";

const SCROLL_THRESHOLD = 16;

export function HeaderClient({ catalog }: { catalog: CategoryBrief[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) {
      setOverHero(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setOverHero(entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pathname]);

  const transparent = overHero && !scrolled;

  return (
    <header className="sticky top-0 z-50">
      <TopBar />
      <NavBar
        catalog={catalog}
        transparent={transparent}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMobile={() => setMobileOpen(true)}
      />
      <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} catalog={catalog} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} catalog={catalog} />
    </header>
  );
}