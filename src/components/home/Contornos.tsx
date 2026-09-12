"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * Curvas de nivel que recorren TODO el inicio.
 *
 * Antes había una trama de curvas, pero solo en dos secciones y como
 * mosaico de fondo que se repetía cada 320px. Eso hace que el dibujo se
 * corte y vuelva a empezar dentro de la misma pantalla, y que entre una
 * sección y la siguiente no tenga nada que ver: se lee como textura de
 * relleno, no como un mapa.
 *
 * Aquí el dibujo es UNO SOLO, del alto de la página entera. Cada sección no
 * enseña "un trozo cualquiera": enseña exactamente el trozo que le toca por
 * dónde está en el documento. Por eso mide su propia posición al montarse.
 *
 * Esa medición es lo que hace que funcione, y el primer intento sin ella se
 * vio enseguida: las secciones del inicio van de 96px a 2821px de alto, así
 * que estirar el mismo dibujo dentro de cada una dejaba las curvas a siete
 * píxeles en una y a dos dedos en la siguiente. Midiendo, la escala es la
 * misma en todas y la curva que sale por abajo de una entra por arriba de
 * la siguiente.
 */

/*
 * El dibujo se mide en PÍXELES, no en unidades propias escaladas al ancho.
 *
 * La primera versión usaba un lienzo fijo de 1200 unidades y dividía por el
 * ancho real, con lo que la escala colgaba del tamaño de la ventana: medido
 * en el móvil, las curvas caían a 16px de separación frente a los 55px del
 * escritorio, y a esa distancia dejan de leerse como curvas de nivel y
 * parecen un rayado. En píxeles la separación es la misma en todas partes.
 *
 * Lo único que sigue siendo relativo es la ONDA: la altura se calcula sobre
 * `t` de 0 a 1, así que el mismo número de ondulaciones cruza la pantalla
 * sea ancha o estrecha, en vez de quedar un solo lomo enorme en el móvil.
 */
const SEPARACION = 52;
const TAU = Math.PI * 2;
/** Desborde lateral de las curvas, para que la deriva no descubra los
    extremos. Ha de ser mayor que el recorrido de `contorno-deriva`. */
const MARGEN = 140;
const MUESTRAS = 13;

/** Altura del relieve en `t` (0–1) para la línea `i`, en píxeles. Sin azar:
    el mismo dibujo en cada carga, y el mismo en todas las secciones. */
function altura(t: number, i: number): number {
  const fase = i * 0.37;
  return (
    i * SEPARACION +
    46 * Math.sin(t * 1.15 * TAU + fase) +
    19 * Math.sin(t * 2.4 * TAU + fase * 1.9 + 1.1) +
    8 * Math.sin(t * 4.1 * TAU + fase * 0.6 + 2.3)
  );
}

/** Catmull-Rom a Bézier: con `L` entre muestras las curvas salen angulosas
    y parecen un gráfico, que es justo lo contrario de lo que son. */
function suavizar(puntos: [number, number][]): string {
  let d = `M${puntos[0][0]} ${puntos[0][1].toFixed(1)}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[Math.max(0, i - 1)];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[Math.min(puntos.length - 1, i + 2)];
    d +=
      `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(0)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}` +
      ` ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(0)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}` +
      ` ${p2[0]} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/* Se calculan a medida que hacen falta y se guardan: el alto de la página
   no se sabe de antemano, así que no hay un número fijo de líneas que
   generar por adelantado. Cada una se traza una sola vez aunque la pidan
   varias secciones.

   La clave lleva el ancho porque ahora el trazo depende de él. Se redondea
   a múltiplos de 20px para que arrastrar el borde de la ventana no genere
   un juego de curvas nuevo en cada píxel. */
const trazadas = new Map<string, string>();
function lineaD(ancho: number, i: number): string {
  const clave = `${ancho}:${i}`;
  const guardada = trazadas.get(clave);
  if (guardada !== undefined) return guardada;
  const total = ancho + MARGEN * 2;
  const d = suavizar(
    Array.from({ length: MUESTRAS }, (_, k) => {
      const x = Math.round(-MARGEN + (k / (MUESTRAS - 1)) * total);
      return [x, altura((x + MARGEN) / total, i)] as [number, number];
    })
  );
  trazadas.set(clave, d);
  return d;
}

/** Posición de un elemento respecto al documento. `getBoundingClientRect`
    no vale aquí: media sección del inicio va CLAVADA, y estando pegada
    arriba devuelve la posición donde se está pintando, no la que ocupa en
    el documento. `offsetTop` es de maquetación y el clavado no lo toca. */
function desdeArriba(el: HTMLElement): number {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

export function Contornos({
  tono = "claro",
  className,
}: {
  /** `oscuro` para las secciones de fondo negro. */
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /* Nada hasta medir. Son decoración, y de todas formas el trazado depende
     de JavaScript; enseñar un dibujo con la escala equivocada durante un
     instante se notaría más que no enseñar nada. */
  const [ventana, setVentana] = useState<{
    desde: number;
    alto: number;
    ancho: number;
  } | null>(null);
  /*
   * El trazado lo lleva ESTE componente, y no el observador general de
   * `Revelados`, aunque sea el mismo gesto. Aquel añade la clase al nodo
   * por fuera de React, y aquí React vuelve a dibujar en cuanto termina de
   * medir: al reconciliar el `className` se llevaba por delante la clase
   * recién puesta. Medido, sobrevivía en 2 de 7 secciones y en las otras
   * cinco las curvas se quedaban sin trazar para siempre.
   */
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const medir = () => {
      const real = el.offsetWidth;
      if (real === 0) return;
      /* Todo en píxeles y redondeado a 20: la escala es 1:1 en los dos ejes
         —ni las curvas se achatan ni se estiran— y el trozo que enseña cada
         sección es literalmente el que le corresponde por su sitio en el
         documento. */
      const ancho = Math.max(20, Math.round(real / 20) * 20);
      setVentana({ desde: desdeArriba(el), alto: el.offsetHeight, ancho });
    };

    medir();

    let io: IntersectionObserver | null = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisto(true);
    } else {
      io = new IntersectionObserver(
        (entradas) => {
          if (!entradas.some((e) => e.isIntersecting)) return;
          setVisto(true);
          io?.disconnect();
        },
        { threshold: 0.1 }
      );
      io.observe(el);
    }

    /* El cuerpo entero, no solo esta caja: lo que mueve el trozo que toca
       enseñar es que crezca CUALQUIER sección de más arriba.
       Y la caja propia además, porque el cuerpo puede no cambiar de alto
       cuando lo que crece está dentro de una sección clavada: medido, el
       carrusel de tours se quedaba con la ventana de antes de cargar sus
       fotos y sus curvas salían un 12% más separadas que las del resto. */
    const ro = new ResizeObserver(medir);
    ro.observe(document.body);
    ro.observe(el);
    return () => {
      ro.disconnect();
      /* También al desmontar, no solo al entrar en pantalla. */
      io?.disconnect();
    };
  }, []);

  const trazo = tono === "oscuro" ? "#ffffff" : "#b8a888";
  const opacidad = tono === "oscuro" ? 0.14 : 0.5;

  let lineas: number[] = [];
  if (ventana) {
    const primera = Math.floor((ventana.desde - SEPARACION) / SEPARACION);
    const ultima = Math.ceil((ventana.desde + ventana.alto + SEPARACION) / SEPARACION);
    for (let i = Math.max(0, primera); i <= ultima; i++) lineas.push(i);
    /* Tope de seguridad. Una sección desmedidamente alta —o una medida
       absurda tras un cambio de tamaño— pediría miles de trazos y los
       dibujaría todos antes de que se notara el problema. */
    if (lineas.length > 60) lineas = lineas.slice(0, 60);
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "contornos pointer-events-none absolute inset-0 overflow-hidden",
        visto && "revelado",
        className
      )}
    >
      {ventana && (
        <svg
          className="h-full w-full"
          viewBox={`0 ${ventana.desde.toFixed(1)} ${ventana.ancho} ${ventana.alto.toFixed(1)}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <g className="contornos-deriva">
            {lineas.map((i, k) => {
              /* Un trazo en ámbar cada nueve. Es el acento de la marca:
                 repartido así cae uno por sección más o menos, y con dos o
                 tres juntos dejaría de ser un acento para ser un rayado. */
              const esAcento = i % 9 === 4;
              return (
                <path
                  key={i}
                  d={lineaD(ventana.ancho, i)}
                  stroke={esAcento ? "#d97706" : trazo}
                  strokeWidth={esAcento ? 1.6 : 1.1}
                  opacity={esAcento ? (tono === "oscuro" ? 0.5 : 0.42) : opacidad}
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                  style={{ animationDelay: `${k * 70}ms` }}
                />
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
