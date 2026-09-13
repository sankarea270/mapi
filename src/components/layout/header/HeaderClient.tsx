"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { NavBar } from "./NavBar";
import { MenuCompleto } from "./MenuCompleto";
import { SearchDialog } from "./SearchDialog";
import type { CategoryBrief } from "@/lib/catalog";

const SCROLL_THRESHOLD = 16;

export function HeaderClient({
  catalog,
  fotos,
}: {
  catalog: CategoryBrief[];
  /** Una foto por dirección de enlace, para la previsualización del menú. */
  fotos: Record<string, string>;
}) {
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

  /*
   * El alto real de la cabecera, publicado como `--alto-cabecera` en el
   * <html> para todo lo que se clava debajo de ella.
   *
   * Antes cada pieza clavada adivinaba su propio desplazamiento: la barra
   * de pestañas de la ficha iba a `top-16` (64px) y el panel de reserva a
   * `top-24` (96px). La cabecera mide 116px en el móvil y 132 en escritorio
   * —barra de contacto más barra de navegación—, así que al bajar las dos
   * quedaban metidas por debajo: las pestañas, enteras; el panel, con su
   * cabecera tapada. Se mide aquí, que es quien sabe lo que mide.
   */
  const cabeceraRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = cabeceraRef.current;
    if (!el) return;
    /* `scrollHeight` y no solo `offsetHeight`: en el móvil el logotipo
       sobresale 10px por debajo de la caja de la cabecera —la caja acaba en
       116 y la línea «Agencia de viajes» en 125—, y con la medida de la caja
       ese texto se montaba encima de lo que se clava debajo. */
    const publicar = () =>
      document.documentElement.style.setProperty(
        "--alto-cabecera",
        `${Math.max(el.offsetHeight, el.scrollHeight)}px`
      );
    publicar();
    const ro = new ResizeObserver(publicar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const transparent = overHero && !scrolled;

  return (
    <header ref={cabeceraRef} className="sticky top-0 z-50">
      <TopBar />
      <NavBar
        transparent={transparent}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMobile={() => setMobileOpen(true)}
      />
      {/* Un solo menú para todos los tamaños: el de tres columnas se
          reduce a una en móvil, así que mantener dos implementaciones
          distintas solo garantizaba que se separaran con el tiempo. */}
      <MenuCompleto
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        catalog={catalog}
        fotos={fotos}
      />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} catalog={catalog} />
    </header>
  );
}