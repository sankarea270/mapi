"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { TextoLetras } from "@/components/home/TextoLetras";
import { cn } from "@/lib/utils";

/** Tour ya traducido: el componente es de cliente y no resuelve idiomas. */
export interface TarjetaTour {
  slug: string;
  nombre: string;
  duracion: string;
  precio: number;
  imagen: string;
}

/** Cada cuánto pasa sola. */
const INTERVALO = 4200;
/** Cuánto hay que arrastrar para que cuente como arrastre y no como clic. */
const UMBRAL = 8;
/** Ventana tras soltar en la que un clic se considera final del arrastre. */
const GRACIA = 250;
/** Tarjetas dibujadas a cada lado. Tres porque la fila se sale de pantalla. */
const LADOS = 3;

/**
 * Carrusel de tours, debajo de la portada.
 *
 * Calcado de la referencia de ingamba.pro: una fila de tarjetas rectas que
 * se sale por los dos lados de la pantalla, cada una con su foto a sangre y
 * el rótulo abajo a la izquierda precedido de un filete. La señalada se
 * levanta un poco, coge sombra y pasa su título al color de marca. Debajo,
 * una barra de progreso en lugar de puntos.
 *
 * El reparto de gestos: el CURSOR cambia de tarjeta, el ARRASTRE mueve
 * varias de golpe, y el CLIC abre el tour SEÑALADO.
 *
 * Ojo con esa última palabra, porque ahí está la trampa: al señalar una
 * tarjeta, esa tarjeta se mueve al centro, y bajo el cursor queda la que
 * ocupa ahora su antiguo sitio. Si cada tarjeta abriera simplemente su
 * propio enlace, al pulsar te llevaría a un tour que no es el que estabas
 * mirando. Por eso el clic va siempre al del centro.
 *
 * Otras tres cosas que no se ven pero deciden si esto funciona:
 *
 *  · Cada tarjeta se coloca por su DISTANCIA a la señalada, por el camino
 *    más corto del círculo, así que al pasar de la última a la primera no
 *    hay un salto hacia atrás recorriendo toda la fila.
 *
 *  · El puntero NO se captura al pulsar, solo cuando el arrastre supera el
 *    umbral. Capturarlo antes hace que el navegador dispare el `click` sobre
 *    la pista y no sobre el enlace: pulsabas y no pasaba nada.
 *
 *  · El círculo que sigue al ratón se mueve escribiendo su `transform`
 *    directamente. Con estado, cada píxel de movimiento volvería a dibujar
 *    las ocho tarjetas.
 *
 * Con `prefers-reduced-motion` no gira solo ni hay transiciones.
 */
export function ToursPackagesCarousel({ tours }: { tours: TarjetaTour[] }) {
  const t = useTranslations();
  const router = useRouter();
  const reducido = useReducedMotion();

  const [activo, setActivo] = useState(0);
  const [quieto, setQuieto] = useState(false);
  const [ancho, setAncho] = useState(300);
  const [arrastre, setArrastre] = useState(0);
  const [agarrando, setAgarrando] = useState(false);
  const [conRaton, setConRaton] = useState(false);

  const pistaRef = useRef<HTMLDivElement>(null);
  const circuloRef = useRef<HTMLSpanElement>(null);
  const inicio = useRef<number | null>(null);
  const movido = useRef(false);
  const puntero = useRef(-1);
  const xUltimoCambio = useRef(Number.NaN);
  const finArrastre = useRef(0);

  const total = tours.length;

  /* La tarjeta se dimensiona con el hueco disponible. Se busca que quepan
     unas cuatro a lo ancho: bastantes para que la fila se lea como si
     siguiera más allá del borde, y suficientemente grandes para que la foto
     mande. Con 4.4 quedaban algo pequeñas. */
  useEffect(() => {
    const el = pistaRef.current;
    if (!el) return;
    const medir = () => setAncho(Math.min(400, Math.max(250, el.clientWidth / 3.85)));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const avanzar = useCallback(
    (saltos: number) => {
      /* El `+ total * 10` mantiene el resto positivo: en JavaScript
         (-1 % 8) es -1, no 7, y la tarjeta se iría fuera de la lista. */
      setActivo((i) => (i + saltos + total * 10) % total);
    },
    [total]
  );

  useEffect(() => {
    if (quieto || reducido || total < 2) return;
    const id = setInterval(() => avanzar(1), INTERVALO);
    return () => clearInterval(id);
  }, [quieto, reducido, total, avanzar]);

  const paso = ancho + 20;
  const alto = Math.round((ancho * 5) / 4);

  /**
   * Traer al centro la tarjeta señalada.
   *
   * Exige que el ratón se haya MOVIDO de verdad desde el cambio anterior, y
   * eso no es una precaución de más: al centrar la señalada, las demás se
   * desplazan, así que bajo un cursor completamente quieto acaba llegando
   * otra tarjeta y el navegador dispara un `mouseenter` nuevo. Sin esta
   * comprobación el carrusel se pondría a girar solo con la mano parada.
   */
  function alSeñalar(i: number, x: number) {
    if (inicio.current !== null) return;
    if (Math.abs(x - xUltimoCambio.current) < UMBRAL) return;
    xUltimoCambio.current = x;
    setActivo(i);
  }

  function alAgarrar(e: React.PointerEvent) {
    inicio.current = e.clientX;
    puntero.current = e.pointerId;
    movido.current = false;
    setQuieto(true);
  }

  function alMover(e: React.PointerEvent) {
    /* El círculo se mueve a mano, sin estado: recorrer la fila con el ratón
       dispara este manejador decenas de veces por segundo. */
    const caja = pistaRef.current?.getBoundingClientRect();
    if (caja && circuloRef.current) {
      circuloRef.current.style.transform =
        `translate(${e.clientX - caja.left}px, ${e.clientY - caja.top}px) translate(-50%, -50%)`;
    }

    if (inicio.current === null) return;
    const dx = e.clientX - inicio.current;

    if (!movido.current) {
      if (Math.abs(dx) <= UMBRAL) return;
      movido.current = true;
      setAgarrando(true);
      try {
        pistaRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* El puntero puede haberse ido ya; sin captura el arrastre sigue
           valiendo mientras no se salga de la pista. */
      }
    }

    setArrastre(dx);
  }

  function alSoltar() {
    if (inicio.current === null) return;
    const saltos = Math.round(-arrastre / paso);
    if (movido.current) finArrastre.current = Date.now();

    if (puntero.current !== -1 && pistaRef.current?.hasPointerCapture(puntero.current)) {
      pistaRef.current.releasePointerCapture(puntero.current);
    }
    puntero.current = -1;

    inicio.current = null;
    setArrastre(0);
    setAgarrando(false);
    if (saltos !== 0) avanzar(saltos);
    setQuieto(false);
  }

  if (total === 0) return null;

  /* El titular lleva la primera palabra en el color de la marca, como la
     referencia. Se parte por el primer espacio y no se guarda troceado en
     las traducciones: así funciona igual en los tres idiomas sin duplicar
     la cadena ni obligar a mantener dos trozos en cada una. */
  const titulo = t("historias.title");
  const corte = titulo.indexOf(" ");
  const primera = corte === -1 ? titulo : titulo.slice(0, corte);
  const resto = corte === -1 ? "" : titulo.slice(corte);

  return (
    <section className="trama-curvas tira-tours overflow-hidden bg-[#faf8f4] py-16 sm:py-20">
      <div className="tira-entra mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold uppercase leading-none text-slate-900 sm:text-[3.2rem]">
          {/* Dos mitades, dos colores, dos barridos encadenados: el del
              acento arranca cuando el otro ya va por el final, así que el
              titular se escribe de un trazo. */}
          <TextoLetras texto={primera} className="text-teal-700" />{" "}
          <TextoLetras texto={resto.trim()} retraso={420} />
        </h2>
        <p className="mt-4 max-w-2xl font-logo text-lg leading-relaxed text-slate-600 sm:text-xl">
          {t("historias.subtitle")}
        </p>
      </div>

      {/* `touch-pan-y`: en un móvil el dedo arrastra la fila a lo ancho pero
          la página sigue bajando. Sin esto, tocar aquí bloquea el scroll
          vertical y el visitante se queda encallado. */}
      <div
        ref={pistaRef}
        className={cn(
          "relative mt-12 touch-pan-y select-none",
          conRaton && !agarrando && "cursor-none",
          agarrando && "cursor-grabbing"
        )}
        style={{ height: Math.round(alto * 1.06) }}
        onPointerDown={alAgarrar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onMouseEnter={() => {
          setQuieto(true);
          setConRaton(true);
        }}
        onMouseLeave={() => {
          xUltimoCambio.current = Number.NaN;
          setConRaton(false);
          if (inicio.current === null) setQuieto(false);
        }}
      >
        {tours.map((tour, i) => {
          let d = i - activo;
          if (d > total / 2) d -= total;
          if (d < -total / 2) d += total;

          const visible = Math.abs(d) <= LADOS;
          const centro = d === 0;
          const x = d * paso + arrastre;

          return (
            <div
              key={tour.slug}
              aria-hidden={!visible}
              onMouseEnter={(e) => alSeñalar(i, e.clientX)}
              className={cn(
                "absolute left-1/2 top-1/2",
                !reducido &&
                  !agarrando &&
                  "transition-[transform,opacity] duration-[650ms] ease-[cubic-bezier(0.22,0.68,0.35,1)]",
                !visible && "pointer-events-none"
              )}
              style={{
                width: ancho,
                zIndex: centro ? 20 : 10 - Math.abs(d),
                opacity: visible ? 1 : 0,
                /* Solo la señalada crece, y poco: en la referencia asoma unos
                   pocos píxeles por arriba y por abajo respecto a sus
                   vecinas. Un salto mayor rompe la fila. */
                transform: `translate(-50%, -50%) translateX(${x}px) scale(${centro ? 1.045 : 1})`,
              }}
            >
              <Link
                href={`/tours/${tour.slug}`}
                tabIndex={visible ? 0 : -1}
                onFocus={() => setActivo(i)}
                onClick={(e) => {
                  if (Date.now() - finArrastre.current < GRACIA) {
                    e.preventDefault();
                    return;
                  }
                  if (!centro) {
                    e.preventDefault();
                    router.push(`/tours/${tours[activo].slug}`);
                  }
                }}
                className={cn(
                  "relative block overflow-hidden outline-none transition-shadow duration-500 focus-visible:ring-2 focus-visible:ring-teal-600",
                  centro ? "shadow-2xl shadow-slate-900/30" : "shadow-none"
                )}
                style={{ height: alto }}
              >
                <Image
                  src={tour.imagen}
                  alt={tour.nombre}
                  fill
                  sizes="340px"
                  draggable={false}
                  className="object-cover"
                />
                {/* El velo solo abajo y en degradado: cubre el rótulo sin
                    apagar la foto entera, que es lo que se ve en la
                    referencia. */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />

                <div className="absolute inset-x-5 bottom-5">
                  {/* Ámbar y no el petróleo de la marca: sobre una foto
                      oscura el petróleo se pierde —2.4:1—, el ámbar da 9:1.
                      Es el mismo criterio que en el menú, al revés: allí el
                      fondo era crema y el que no valía era el ámbar. */}
                  <h3
                    className={cn(
                      "font-heading text-[1.7rem] font-bold uppercase leading-none transition-colors duration-500",
                      centro ? "text-amber-400" : "text-white"
                    )}
                  >
                    {tour.nombre}
                  </h3>
                  <p className="mt-3 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/85">
                    <span aria-hidden className="h-px w-7 bg-white/60" />
                    {t("nav.seeTour")}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}

        {/* El círculo que acompaña al cursor. Decorativo y solo con ratón:
            en una pantalla táctil no hay puntero al que seguir. */}
        <span
          ref={circuloRef}
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-30 grid size-16 place-items-center rounded-full border border-white/70 transition-opacity duration-300",
            conRaton && !agarrando ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="flex w-full items-center justify-between px-2 text-sm text-white/90">
            <span>‹</span>
            <span>›</span>
          </span>
        </span>
      </div>

      {/* Barra de progreso. Dice cuántas hay y por dónde vas sin ocupar una
          fila de puntos, que con ocho tours ya empezaba a leerse como ruido. */}
      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
        <div className="h-px w-full bg-slate-300">
          <div
            className="h-px bg-teal-700 transition-[width] duration-[650ms] ease-[cubic-bezier(0.22,0.68,0.35,1)]"
            style={{ width: `${((activo + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
