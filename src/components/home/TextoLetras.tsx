"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Titular que se escribe solo al aparecer en pantalla.
 *
 * El texto arranca invisible y una franja lo va revelando de izquierda a
 * derecha: detrás queda escrito, delante todavía no está. Es el efecto de
 * la referencia `DiaText`.
 *
 * Cómo se hace: el elemento pinta un degradado horizontal y se recorta con
 * `background-clip: text`, así que del degradado solo se ve la silueta de
 * las letras. Ese degradado va del propio color del titular a transparente,
 * y lo único que se anima es su POSICIÓN. Al desplazarlo, el borde entre lo
 * sólido y lo transparente barre el texto.
 *
 * Usar `currentColor` en las paradas es lo que hace que esto valga igual
 * para un titular negro sobre crema y para uno blanco sobre foto: se
 * escribe en su propio color, sin ninguna constante que mantener a mano.
 *
 * ---
 *
 * POR QUÉ SE DISPARA AL ENTRAR EN PANTALLA Y NO CON EL SCROLL.
 *
 * El resto de animaciones del sitio van atadas al scroll con
 * `animation-timeline: view()`, y aquí no se puede. Estos titulares viven
 * dentro de secciones CLAVADAS: en cuanto la sección se pega arriba, el
 * titular deja de moverse respecto a la ventana, y una línea de tiempo que
 * mide justo eso se queda parada. Medido: la animación en marcha y el
 * progreso clavado en 0 a cinco alturas de scroll distintas, con el texto
 * invisible. Prestarle la línea de tiempo de la pista tampoco salió: una
 * pista de 180vh nunca cabe entera en la ventana, así que la fase `contain`
 * no existe y el avance saltaba de 0 a 1 de golpe.
 *
 * Un observador de intersección no depende de nada de eso, y además es lo
 * que hace la referencia. El coste es que este componente pasa a ser de
 * cliente; a cambio, catorce líneas y ninguna librería. La referencia trae
 * `motion` —unos 50 KB— para esto mismo.
 *
 * ---
 *
 * ANTES el texto se partía en un `<span>` por letra. Se cambia por tres
 * razones, y ninguna es estética: a media animación las letras quedaban a
 * distinta opacidad y el titular parecía desmoronarse en vez de escribirse;
 * metía entre 15 y 50 elementos por titular; y cada letra tenía que ser
 * `inline-block`, de donde salió el fallo de los espacios entre palabras
 * —un espacio al final de una caja así se descarta y las palabras salían
 * pegadas—. Aquí el texto es texto normal y eso no puede volver.
 */
export function TextoLetras({
  texto,
  className,
}: {
  texto: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [escrito, setEscrito] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Quien pide menos movimiento se lo encuentra ya escrito. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEscrito(true);
      return;
    }

    const ob = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setEscrito(true);
        /* Una vez escrito no hace falta seguir mirando, y así tampoco se
           reescribe cada vez que se pasa por delante. */
        ob.disconnect();
      },
      { threshold: 0.25 }
    );

    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <span ref={ref} className={cn("escribe", escrito && "escribe--ya", className)}>
      {texto}
    </span>
  );
}
