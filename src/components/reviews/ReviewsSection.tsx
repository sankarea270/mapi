"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Pause, Play, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Review } from "@/data/reviews";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { pickLocalized } from "@/lib/format";
import { TextoLetras } from "@/components/home/TextoLetras";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Contornos } from "@/components/home/Contornos";
import { fichaDe, type Ficha } from "@/lib/resenas";


/** Velocidad de crucero de la cinta, en px por segundo. */
const VELOCIDAD = 34;
/** Constante de tiempo, en ms, con la que la velocidad persigue su objetivo.
    Es el "peso" de la cinta: cuánto tarda en frenar y en volver a arrancar. */
const INERCIA = 260;
/** Cuánto hay que mover el puntero para que cuente como arrastre. */
const UMBRAL = 6;
/** Tope del impulso al soltar un arrastre, en px por segundo. */
const IMPULSO_MAX = 1400;
/** Tarjetas mínimas por vuelta. Con menos, en pantalla ancha se vería el
    final de la cinta antes de que empiece la copia. */
const MIN_POR_VUELTA = 6;

/** Dos iniciales, saltándose lo que no es letra: "Carlos & Ana" da "CA". */
function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter((p) => /\p{L}/u.test(p[0] ?? ""))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/**
 * Opiniones reales: una cinta continua de tarjetas pequeñas.
 *
 * Sustituye al carrusel de tres que cambiaba a saltos. Aquel funcionaba,
 * pero cada cinco segundos y medio todo se detenía, salía y entraba a la
 * vez: un compás de metrónomo, que es justo lo que se lee como robótico. Y
 * con tarjetas de 352px solo cabían tres opiniones en pantalla.
 *
 * Aquí las opiniones pasan sin cortes y el movimiento tiene peso. Al pasar
 * el ratón la cinta no se para en seco: frena. Al quitarlo, arranca poco a
 * poco. Al arrastrarla y soltar, sigue deslizándose con el impulso del gesto
 * y se asienta. Todo sale de una sola regla —la velocidad persigue a su
 * objetivo con una constante de tiempo— y por eso los tres gestos se sienten
 * como el mismo objeto.
 *
 * La velocidad es de 34px/s: una tarjeta tarda unos diez segundos en cruzar,
 * lo bastante lento como para leerla mientras pasa.
 *
 * Sin foto ni fecha, a propósito. No hay retratos reales de los viajeros y
 * las reseñas no guardan cuándo se escribieron; poner caras de banco o
 * fechas inventadas sería fingir justo en la sección que se titula
 * «opiniones reales». Van las iniciales, y la fecha podrá ir cuando el panel
 * la recoja.
 */
export function ReviewsSection({
  reviews,
  fichas,
}: {
  reviews: Review[];
  /** Fichas del catálogo por tipo y dirección. Solo trae las que existen. */
  fichas: Record<string, Ficha>;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const reducido = useReducedMotion();

  const [pausada, setPausada] = useState(false);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const ventanaRef = useRef<HTMLDivElement>(null);
  const pistaRef = useRef<HTMLDivElement>(null);
  const copiaRef = useRef<HTMLDivElement>(null);

  /* Todo lo que lee el bucle va en referencias: lo consulta sesenta veces por
     segundo y no puede esperar a un render de React para enterarse. */
  const pos = useRef(0);
  const vel = useRef(VELOCIDAD);
  const ancho = useRef(0);
  const frenos = useRef({ encima: false, foco: false, fuera: false, pausada: false, abierta: false });
  const gesto = useRef<{
    x: number;
    base: number;
    ultima: number;
    t: number;
    v: number;
    movido: boolean;
    id: number;
  } | null>(null);
  const tragarClic = useRef(false);

  const total = reviews.length;

  /* La media con el separador decimal de cada idioma. Antes se cambiaba el
     punto por coma a mano, y en inglés salía "4,9". */
  const numero = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const media = total > 0 ? reviews.reduce((n, r) => n + r.rating, 0) / total : 0;

  /* Una vuelta de cinta. Si hay pocas reseñas se repiten dentro de la vuelta
     hasta llenarla. */
  const vuelta: number[] = [];
  for (let k = 0; total > 0 && vuelta.length < Math.max(MIN_POR_VUELTA, total); k++) {
    vuelta.push(k % total);
  }

  useEffect(() => {
    frenos.current.pausada = pausada;
  }, [pausada]);

  useEffect(() => {
    frenos.current.abierta = abierta !== null;
  }, [abierta]);

  /* El bucle de la cinta. */
  useEffect(() => {
    const pista = pistaRef.current;
    const ventana = ventanaRef.current;
    const copia = copiaRef.current;
    if (reducido || !pista || !ventana || !copia || total === 0) return;

    /* El ancho de una vuelta se mide al cambiar, no en cada fotograma: leer
       medidas dentro del bucle obligaría al navegador a recalcular la
       maqueta sesenta veces por segundo. */
    const ro = new ResizeObserver(() => {
      ancho.current = copia.offsetWidth;
    });
    ro.observe(copia);

    /* Fuera de pantalla no hay nada que mover. */
    const io = new IntersectionObserver(
      ([e]) => {
        frenos.current.fuera = !e.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    io.observe(ventana);

    let raf = 0;
    let antes = performance.now();

    const paso = (ahora: number) => {
      /* Tope de 64ms: al volver de otra pestaña el primer intervalo puede
         ser de minutos, y la cinta daría un salto de varias vueltas. */
      const dt = Math.min(64, ahora - antes);
      antes = ahora;

      const f = frenos.current;
      const w = ancho.current;

      if (!gesto.current?.movido) {
        const meta = f.encima || f.foco || f.pausada || f.abierta || f.fuera ? 0 : VELOCIDAD;
        /* La regla de todo el movimiento: la velocidad se acerca a su meta
           en proporción a lo que le falta. Frenar, arrancar y asentarse
           tras un lanzamiento son el mismo cálculo. */
        vel.current += (meta - vel.current) * (1 - Math.exp(-dt / INERCIA));
        pos.current -= (vel.current * dt) / 1000;
      }

      if (w > 0) {
        while (pos.current <= -w) pos.current += w;
        while (pos.current > 0) pos.current -= w;
      }

      pista.style.transform = `translate3d(${pos.current.toFixed(2)}px, 0, 0)`;
      raf = requestAnimationFrame(paso);
    };

    raf = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reducido, total]);

  /* ── Arrastre ──────────────────────────────────────────────────────────
     El puntero no se captura al pulsar, solo cuando el gesto ya se movió:
     capturarlo antes hace que el clic caiga sobre la cinta y no sobre el
     enlace o el botón que hay debajo. */
  function alBajar(e: React.PointerEvent) {
    if (reducido || e.button !== 0) return;
    tragarClic.current = false;
    gesto.current = {
      x: e.clientX,
      base: pos.current,
      ultima: pos.current,
      t: performance.now(),
      v: 0,
      movido: false,
      id: e.pointerId,
    };
  }

  function alMover(e: React.PointerEvent) {
    const g = gesto.current;
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x;

    if (!g.movido) {
      if (Math.abs(dx) < UMBRAL) return;
      g.movido = true;
      setArrastrando(true);
      try {
        ventanaRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* El puntero puede haberse ido ya. */
      }
    }

    const ahora = performance.now();
    const nueva = g.base + dx;
    /* La velocidad del gesto se suaviza: la de un solo evento es ruidosa y
       el lanzamiento dependería de si el último movimiento fue de 1px o 9. */
    const instante = ((nueva - g.ultima) / Math.max(1, ahora - g.t)) * 1000;
    g.v = g.v * 0.6 + instante * 0.4;
    g.ultima = nueva;
    g.t = ahora;
    pos.current = nueva;
  }

  function alSoltar(e: React.PointerEvent) {
    const g = gesto.current;
    if (!g || e.pointerId !== g.id) return;
    gesto.current = null;
    if (!g.movido) return;

    tragarClic.current = true;
    /* Y se desarma justo después. El clic que hay que tragarse lo lanza el
       navegador en la misma tanda que el `pointerup`; si no llega —soltar
       fuera de la cinta, por ejemplo— la marca se quedaba puesta y se comía
       el siguiente clic de verdad. Con teclado se notaba: tras arrastrar,
       pulsar Intro en «Leer reseña completa» no hacía nada. */
    setTimeout(() => {
      tragarClic.current = false;
    }, 0);
    setArrastrando(false);
    /* Si el dedo se quedó quieto antes de soltar, no hay impulso: soltar
       una cinta sujeta no debería lanzarla. */
    const v = performance.now() - g.t > 80 ? 0 : g.v;
    /* `v` es hacia la derecha; `vel` cuenta hacia la izquierda. */
    vel.current = Math.max(-IMPULSO_MAX, Math.min(IMPULSO_MAX, -v));
  }

  /* Con teclado, la tarjeta que recibe el foco se trae al centro. Sin esto
     el foco podía caer en una tarjeta que está fuera de la ventana. */
  function alEnfocar(e: React.FocusEvent) {
    const el = e.target as HTMLElement;
    if (!el.matches(":focus-visible")) return;
    frenos.current.foco = true;
    const tarjeta = el.closest("article");
    const ventana = ventanaRef.current;
    if (tarjeta && ventana && !reducido) {
      pos.current = -(tarjeta.offsetLeft + tarjeta.offsetWidth / 2 - ventana.clientWidth / 2);
      vel.current = 0;
    }
  }

  if (total === 0) return null;

  const copias = reducido ? [0] : [0, 1];

  return (
    <section className="relative overflow-hidden bg-[#faf8f4] py-20 sm:py-24">
      <Contornos />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="escena-texto mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-600">
            {t("badge")}
          </p>
          <h2 className="mt-5 font-heading text-[2.1rem] font-bold uppercase leading-[0.95] text-slate-900 sm:text-[3.2rem]">
            {/* Cada mitad se escribe por su lado porque van en colores
                distintos, y el barrido se apoya en el color del propio
                elemento. */}
            <TextoLetras texto={t("titlePlain")} />{" "}
            <TextoLetras texto={t("titleAccent")} className="text-teal-700" retraso={620} />
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-logo text-lg leading-relaxed text-slate-600 sm:text-xl">
            {t("subtitle")}
          </p>

          {/* El dato en crudo, medido sobre las reseñas publicadas. */}
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="flex items-center gap-1.5 text-amber-600">
              <Star className="size-3.5 fill-current" aria-hidden />
              <span className="tabular-nums">{numero.format(media)}</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-slate-300" />
            <span className="tabular-nums">{t("count", { count: total })}</span>
          </p>
        </div>
      </div>

      {/* La ventana va fuera del contenedor de 7xl y un poco más ancha: la
          cinta tiene que entrar y salir por los bordes fundidos, no aparecer
          recortada contra un margen. El relleno vertical deja sitio a la
          sombra, que si no quedaría cortada por el recorte de la ventana. */}
      <div
        ref={ventanaRef}
        className={cn(
          "cinta-ventana relative mx-auto mt-10 max-w-[92rem] py-6 sm:mt-12",
          reducido
            ? "flex snap-x snap-mandatory overflow-x-auto px-6"
            : cn("overflow-hidden", arrastrando ? "cursor-grabbing select-none" : "cursor-grab")
        )}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") frenos.current.encima = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") frenos.current.encima = false;
        }}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onClickCapture={(e) => {
          /* Tras un arrastre, el clic que dispara el navegador al soltar no
             debe abrir el enlace sobre el que acabó el dedo. */
          if (tragarClic.current) {
            e.preventDefault();
            e.stopPropagation();
            tragarClic.current = false;
          }
        }}
        onFocus={alEnfocar}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) frenos.current.foco = false;
        }}
        style={{ touchAction: "pan-y" }}
      >
        <div ref={pistaRef} className="relative flex w-max will-change-transform">
          {copias.map((copia) => (
            <div
              key={copia}
              ref={copia === 0 ? copiaRef : undefined}
              /* El hueco va como relleno a la derecha de cada copia y no
                 como `gap` entre ellas: así una copia mide exactamente una
                 vuelta y la costura entre las dos no se nota. */
              className="flex items-start gap-4 pr-4"
            >
              {vuelta.map((i, k) => {
                const r = reviews[i];
                const clave = `${copia}-${k}`;
                /* Solo la primera aparición de cada reseña es accesible: las
                   repeticiones y la copia existen para que la cinta no se
                   acabe, y un lector de pantalla las leería todas. */
                const oculta = copia > 0 || k >= total;
                const ficha = fichaDe(r, fichas);
                /* 4,5 se pinta como cuatro estrellas y el número al lado. Con
                   redondeo normal salían cinco, y la tarjeta prometía más
                   de lo que decía la reseña. */
                const estrellas = Math.floor(r.rating + 0.25);

                return (
                  <article
                    key={clave}
                    aria-hidden={oculta || undefined}
                    className={cn(
                      "resena flex w-[18.5rem] shrink-0 flex-col rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/[0.06] transition-shadow duration-300 hover:shadow-xl hover:shadow-teal-900/15 sm:w-[20rem]",
                      reducido && "snap-start"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="resena-inicial grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 font-heading text-[15px] font-bold text-teal-800 transition-colors duration-300"
                      >
                        {iniciales(r.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="resena-nombre truncate font-heading text-[14px] font-bold uppercase tracking-[0.08em] text-slate-900 transition-colors duration-300">
                          {r.name}
                        </p>
                        {r.country && (
                          <p className="resena-pais truncate text-[13px] text-slate-500 transition-colors duration-300">
                            {r.country}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center gap-2">
                      <div
                        className="flex gap-0.5"
                        role="img"
                        aria-label={`${numero.format(r.rating)} / 5`}
                      >
                        {Array.from({ length: 5 }).map((_, e) => (
                          <Star
                            key={e}
                            aria-hidden
                            className={cn(
                              "size-3.5 transition-colors duration-300",
                              e < estrellas
                                ? "resena-estrella fill-current text-amber-500"
                                : "resena-estrella-vacia text-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <span className="resena-nota font-heading text-[12px] font-bold tabular-nums text-slate-500 transition-colors duration-300">
                        {numero.format(r.rating)}
                      </span>
                    </div>

                    <Cita
                      texto={pickLocalized(r.text, locale)}
                      abierta={abierta === clave}
                      onAlternar={() => setAbierta((a) => (a === clave ? null : clave))}
                      oculta={oculta}
                      leer={t("readMore")}
                      cerrar={t("readLess")}
                    />

                    {/* El viaje del que habla, al pie. El hueco se reserva
                        aunque no haya ficha para que el pie de todas las
                        tarjetas caiga a la misma altura. */}
                    <div className="mt-auto pt-3">
                      <div className="flex h-8 items-center">
                        {ficha && (
                          <Link
                            href={ficha.href}
                            tabIndex={oculta ? -1 : undefined}
                            draggable={false}
                            className="resena-ficha group/f flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1 pr-3 transition-colors duration-300"
                          >
                            <Image
                              src={ficha.imagen}
                              alt=""
                              width={48}
                              height={48}
                              sizes="24px"
                              draggable={false}
                              className="size-6 shrink-0 rounded-full object-cover"
                            />
                            <span className="resena-ficha-txt min-w-0 truncate font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600 transition-colors duration-300 group-hover/f:text-teal-700">
                              {ficha.nombre}
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mandar parar lo que se mueve solo. Pasar el ratón ya lo detiene,
          pero en un móvil no hay ratón, y a quien le cuesta leer texto en
          movimiento no se le puede pedir que lo persiga. */}
      {!reducido && (
        <div className="relative mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setPausada((p) => !p)}
            aria-pressed={pausada}
            className="flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:border-teal-700 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {pausada ? (
              <Play className="size-3.5" aria-hidden />
            ) : (
              <Pause className="size-3.5" aria-hidden />
            )}
            {pausada ? t("play") : t("pause")}
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * La cita, recortada a tres líneas con la opción de leerla entera.
 *
 * El botón solo aparece si de verdad sobra texto: se mide, no se adivina por
 * el número de caracteres, porque lo que cabe en tres líneas depende del
 * idioma y del ancho de la tarjeta.
 */
function Cita({
  texto,
  abierta,
  onAlternar,
  oculta,
  leer,
  cerrar,
}: {
  texto: string;
  abierta: boolean;
  onAlternar: () => void;
  oculta: boolean;
  leer: string;
  cerrar: string;
}) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [sobra, setSobra] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || abierta) return;
    const medir = () => setSobra(el.scrollHeight > el.clientHeight + 1);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [abierta, texto]);

  return (
    <>
      <blockquote
        ref={ref}
        className={cn(
          /* Tres renglones de alto aunque la cita sea más corta: con eso las
             tarjetas miden lo mismo sin fijarles un alto mínimo a ojo. */
          "resena-cita mt-2.5 min-h-[4.65em] font-logo text-[16px] leading-[1.55] text-slate-600 transition-colors duration-300",
          !abierta && "line-clamp-3",
          !abierta && sobra && "resena-cita--corta"
        )}
      >
        &ldquo;{texto}&rdquo;
      </blockquote>

      {/* El renglón del botón se reserva aunque no haga falta. Solo lo
          llevan las citas que no caben, y sin reservarlo unas tarjetas
          medían 287px y otras 259: la cinta se veía dentada. Abierta, el
          alto es libre, y crece sola esa tarjeta. */}
      <div className={cn("mt-2", !abierta && "h-5")}>
        {(sobra || abierta) && (
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={abierta}
          tabIndex={oculta ? -1 : undefined}
          className="resena-leer inline-flex items-center gap-1 font-heading text-[12px] font-bold uppercase tracking-[0.08em] text-slate-700 transition-colors duration-300 hover:text-teal-700"
        >
          {abierta ? cerrar : leer}
          <ChevronDown
            aria-hidden
            className={cn("size-3.5 transition-transform duration-300", abierta && "rotate-180")}
          />
        </button>
        )}
      </div>
    </>
  );
}
