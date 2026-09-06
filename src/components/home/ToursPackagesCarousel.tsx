"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
/** Tarjetas visibles a cada lado de la del medio. */
const LADOS = 2;

/**
 * Carrusel de tours, debajo de la portada.
 *
 * La del medio va entera y las de los lados encogidas y atenuadas, así que
 * la mirada cae donde tiene que caer. Pasa sola, se arrastra con el ratón y
 * se puede pulsar una de los lados para traerla al centro.
 *
 * Cuatro decisiones que no se ven pero deciden si esto funciona:
 *
 *  · Cada tarjeta se coloca por su DISTANCIA a la del medio, tomada por el
 *    camino más corto del círculo. Por eso al pasar de la última a la
 *    primera no hay un salto hacia atrás recorriendo toda la fila: la
 *    primera ya venía llegando por el otro lado.
 *
 *  · Arrastrar y pulsar comparten el mismo gesto, así que hace falta un
 *    umbral. Sin él, soltar tras mover el ratón tres píxeles abre el tour,
 *    que es justo lo que no querías al arrastrar.
 *
 *  · La colocación va en `transform` en línea, y por eso la animación de
 *    entrada NO puede ir en la tarjeta: son la misma propiedad y una
 *    anularía a la otra. Va en un envoltorio de más arriba.
 *
 *  · El giro automático se para al pasar el ratón, al tabular dentro y
 *    mientras se arrastra. Un carrusel que sigue girando mientras lees una
 *    tarjeta te la quita de delante.
 *
 * Con `prefers-reduced-motion` no gira solo ni hay transiciones: se queda
 * quieto y se maneja a mano, que es lo que pide quien activa esa opción.
 */
export function ToursPackagesCarousel({ tours }: { tours: TarjetaTour[] }) {
  const t = useTranslations();
  const reducido = useReducedMotion();

  const [activo, setActivo] = useState(0);
  const [quieto, setQuieto] = useState(false);
  const [ancho, setAncho] = useState(300);
  const [arrastre, setArrastre] = useState(0);
  const [agarrando, setAgarrando] = useState(false);

  const pistaRef = useRef<HTMLDivElement>(null);
  const inicio = useRef<number | null>(null);
  const movido = useRef(false);
  /* Cuándo terminó el último arrastre de verdad. Se guarda el INSTANTE y no
     un simple "sí/no": un indicador que solo se apaga al volver a pulsar se
     queda encendido para siempre si el siguiente clic no viene del ratón, y
     entonces Enter sobre una tarjeta enfocada no abría el tour. Con una
     ventana corta, el clic que cierra el gesto se descarta y el del teclado,
     que llega mucho después, pasa. */
  const finArrastre = useRef(0);

  const total = tours.length;

  /* La tarjeta se dimensiona con el hueco disponible y no con un ancho fijo:
     a 375px una tarjeta de 310 no deja ver las de los lados, y sin esos
     bordes asomando nadie sabe que hay más ni que se puede arrastrar. */
  useEffect(() => {
    const el = pistaRef.current;
    if (!el) return;
    const medir = () => setAncho(Math.min(310, Math.max(196, el.clientWidth * 0.62)));
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

  const paso = ancho * 0.9;
  const alto = Math.round((ancho * 4) / 3 + 96);

  function alAgarrar(e: React.PointerEvent) {
    inicio.current = e.clientX;
    movido.current = false;
    setAgarrando(true);
    setQuieto(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* El puntero puede haberse ido ya. Sin captura el arrastre sigue
         valiendo mientras no se salga de la pista; peor sería quedarse a
         medias con el estado ya tocado. */
    }
  }

  function alMover(e: React.PointerEvent) {
    if (inicio.current === null) return;
    const dx = e.clientX - inicio.current;
    if (Math.abs(dx) > UMBRAL) movido.current = true;
    setArrastre(dx);
  }

  function alSoltar() {
    if (inicio.current === null) return;
    const saltos = Math.round(-arrastre / paso);
    if (movido.current) finArrastre.current = Date.now();
    inicio.current = null;
    setArrastre(0);
    setAgarrando(false);
    if (saltos !== 0) avanzar(saltos);
    setQuieto(false);
  }

  if (total === 0) return null;

  return (
    <section className="tira-tours overflow-hidden bg-slate-50 py-16 sm:py-20">
      <div className="tira-entra mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-[2.6rem]">
          {t("historias.title")}
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
          {t("historias.subtitle")}
        </p>
      </div>

      {/* `touch-pan-y`: en un móvil el dedo arrastra el carrusel a lo ancho
          pero la página sigue bajando a lo alto. Sin esto, tocar aquí
          bloquea el scroll vertical y el visitante se queda encallado. */}
      <div
        ref={pistaRef}
        className={cn(
          "relative mt-12 touch-pan-y select-none",
          agarrando ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ height: alto }}
        onPointerDown={alAgarrar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onMouseEnter={() => setQuieto(true)}
        onMouseLeave={() => {
          if (inicio.current === null) setQuieto(false);
        }}
      >
        {tours.map((tour, i) => {
          /* Distancia por el camino corto: con 8 tarjetas y la del medio en
             la 7, la 0 está a +1 y no a −7. */
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
              className={cn(
                "absolute left-1/2 top-1/2",
                !reducido &&
                  !agarrando &&
                  "transition-[transform,opacity] duration-[650ms] ease-[cubic-bezier(0.22,0.68,0.35,1)]",
                !visible && "pointer-events-none"
              )}
              style={{
                width: ancho,
                zIndex: 10 - Math.abs(d),
                opacity: visible ? (centro ? 1 : 0.55) : 0,
                transform: `translate(-50%, -50%) translateX(${x}px) scale(${centro ? 1 : 0.82})`,
              }}
            >
              <Link
                href={`/tours/${tour.slug}`}
                tabIndex={visible ? 0 : -1}
                onFocus={() => setActivo(i)}
                onClick={(e) => {
                  /* Si viene de un arrastre, el clic es el final del gesto y
                     no una intención de abrir. Y si la tarjeta no está en el
                     centro, el primer clic la trae; abrirla es el segundo. */
                  const trasArrastre = Date.now() - finArrastre.current < GRACIA;
                  if (trasArrastre || !centro) {
                    e.preventDefault();
                    if (!trasArrastre) setActivo(i);
                  }
                }}
                className={cn(
                  "story-card-container block rounded-[2rem] bg-white p-3 outline-none transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-teal-600",
                  centro ? "shadow-2xl shadow-slate-900/25" : "shadow-lg"
                )}
              >
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={tour.imagen}
                    alt={tour.nombre}
                    fill
                    sizes="320px"
                    draggable={false}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <h3 className="absolute inset-x-5 bottom-5 font-heading text-xl font-bold leading-tight text-white">
                    {tour.nombre}
                  </h3>
                </div>

                <p className="flex items-baseline justify-between gap-2 px-2 pb-1 pt-3.5 text-sm text-slate-500">
                  {tour.duracion}
                  <span className="font-heading text-lg font-bold text-slate-900">
                    ${tour.precio}
                  </span>
                </p>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Marcas de posición. Sin ellas no hay forma de saber cuántas hay ni
          por dónde vas, y el giro automático se lee como algo que se mueve
          sin motivo. */}
      <div className="mt-10 flex justify-center gap-2">
        {tours.map((tour, i) => (
          <button
            key={tour.slug}
            type="button"
            onClick={() => setActivo(i)}
            aria-label={tour.nombre}
            aria-current={i === activo}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === activo ? "w-7 bg-teal-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"
            )}
          />
        ))}
      </div>
    </section>
  );
}
