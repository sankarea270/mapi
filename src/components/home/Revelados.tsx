"use client";

import { useEffect } from "react";

/** Lo que se revela al entrar en pantalla. */
/* Los TITULARES quedan fuera: se revelan escribiéndose, y no cayendo. Y
   `:not(.sr-only)` deja fuera los avisos para lectores de pantalla, que son
   invisibles por diseño; además la rueda rehace el suyo en cada giro, así
   que sin esto se reobservaba y reanimaba cada pocos segundos un elemento
   que nadie mira. */
/* Las curvas de nivel NO entran aquí: se observan solas. Este observador
   pone la clase por fuera de React, y ese componente vuelve a dibujarse en
   cuanto termina de medirse, así que al reconciliar se la quitaba. */
const SELECTOR =
  ".escena-texto > *:not(.sr-only):not(:is(h1,h2,h3,h4,h5,h6)), .escena-foto, .revela-marco";

/**
 * Dispara las entradas de las secciones cuando aparecen en pantalla.
 *
 * Antes iban atadas al scroll con `animation-timeline: view()`. Eso no
 * funciona aquí, y el fallo se ve: estos bloques viven dentro de secciones
 * CLAVADAS, y en cuanto la sección se pega arriba dejan de moverse respecto
 * a la ventana. Una línea de tiempo que mide justo ese movimiento se queda
 * parada, y con ella la animación: el titular acababa de escribirse pero la
 * entradilla se quedaba a medio revelar para siempre, enseñando solo el
 * final de la última línea.
 *
 * Con un observador de intersección eso no puede pasar: la entrada se
 * dispara al aparecer y dura lo que dura, con la sección quieta o no.
 *
 * Por qué un observador SUELTO y no un componente que envuelva cada bloque:
 * `.escena-texto` y `.escena-foto` están repartidos por media docena de
 * sitios, varios de ellos componentes de servidor. Envolverlos exigiría
 * tocarlos todos y convertir algunos a cliente; esto se monta una vez y los
 * alcanza a todos.
 *
 * La marca `js-revelar` en el <html> es lo que permite esconderlos sin
 * riesgo. El CSS solo oculta lo que hay dentro de esa marca, y la marca la
 * pone este mismo componente: si el JavaScript no llega a ejecutarse, nada
 * se esconde y todo se ve, que es como debe fallar.
 */
export function Revelados() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const raiz = document.documentElement;
    raiz.classList.add("js-revelar");

    const ob = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("revelado");
          /* Se deja de observar en cuanto entra: la entrada es de una vez, y
             así tampoco se repite al volver a pasar por delante. */
          ob.unobserve(e.target);
        }
      },
      { threshold: 0.15 }
    );

    const vigilar = (raizBusqueda: ParentNode) => {
      raizBusqueda.querySelectorAll(SELECTOR).forEach((el) => {
        if (!el.classList.contains("revelado")) ob.observe(el);
      });
    };

    vigilar(document);

    /* Y los que aparezcan DESPUÉS. No es una precaución teórica: la rueda de
       destinos rehace su etiqueta cada vez que gira, así que ese nodo es
       nuevo y el observador inicial no lo vio nunca. Como el CSS esconde
       todo lo que encaja con el selector, sin esto el nombre del destino se
       quedaba invisible al primer giro. Medido: 15 de 16 revelados y ese
       uno en opacidad 0.

       Solo `childList`: los cambios de atributo —el carrusel reescribiendo
       transformaciones decenas de veces por segundo— no interesan aquí. */
    const mo = new MutationObserver((cambios) => {
      for (const c of cambios) {
        for (const nodo of c.addedNodes) {
          if (!(nodo instanceof HTMLElement)) continue;
          if (nodo.matches(SELECTOR) && !nodo.classList.contains("revelado")) {
            ob.observe(nodo);
          }
          vigilar(nodo);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      ob.disconnect();
      mo.disconnect();
      raiz.classList.remove("js-revelar");
    };
  }, []);

  return null;
}
