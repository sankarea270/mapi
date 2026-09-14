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
  experiencias,
}: {
  catalog: CategoryBrief[];
  /** Una foto por dirección de enlace, para la previsualización del menú. */
  fotos: Record<string, string>;
  /** Las experiencias publicadas, ya en el idioma de la página. */
  experiencias: Array<{ etiqueta: string; href: string; imagen: string }>;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  /* Barra de contacto recogida: al bajar por la página se esconde y al
     subir vuelve. Son 36px de la parte alta de la pantalla que en un móvil
     se notan mucho, y lo que llevan —WhatsApp, teléfono, idioma— sigue a
     mano en el botón de contacto y en el menú. */
  const [recogida, setRecogida] = useState(false);

  useEffect(() => {
    let anterior = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > SCROLL_THRESHOLD);
      /* Umbral de 6px en cada sentido: sin él, el temblor de un dedo
         apoyado en la pantalla la haría subir y bajar sin parar. Arriba del
         todo siempre se ve. */
      if (y < 180) setRecogida(false);
      else if (y > anterior + 6) setRecogida(true);
      else if (y < anterior - 6) setRecogida(false);
      if (Math.abs(y - anterior) > 6) anterior = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Con el menú o el buscador abiertos, la cabecera no se mueve. */
  const oculta = recogida && !mobileOpen && !searchOpen;

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
    /* Con la barra de contacto recogida se publica el alto que se VE, no el
       de la caja: la cabecera sube con `transform`, que no cambia su caja, y
       lo que se clava debajo tiene que subir con ella. */
    const publicar = () => {
      const barra = (el.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;
      const alto = Math.max(el.offsetHeight, el.scrollHeight) - (oculta ? barra : 0);
      document.documentElement.style.setProperty("--alto-cabecera", `${alto}px`);
      el.style.transform = oculta ? `translateY(-${barra}px)` : "";
    };
    publicar();
    const ro = new ResizeObserver(publicar);
    ro.observe(el);
    return () => ro.disconnect();
  }, [oculta]);

  const transparent = overHero && !scrolled;

  return (
    /* `transform` y no cambiar la altura: la cabecera va clavada y en el
       flujo del documento, así que encogerla movería toda la página hacia
       arriba en mitad del scroll, y ese salto dispararía otra vez el
       gesto de subir. */
    <header
      ref={cabeceraRef}
      className="sticky top-0 z-50 transition-transform duration-300 ease-out motion-reduce:transition-none"
    >
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
        experiencias={experiencias}
      />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} catalog={catalog} />
    </header>
  );
}