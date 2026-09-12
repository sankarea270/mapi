"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Review } from "@/data/reviews";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { pickLocalized } from "@/lib/format";
import { TextoLetras } from "@/components/home/TextoLetras";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Contornos } from "@/components/home/Contornos";

/** Cada cuánto pasa sola. */
const INTERVALO = 5500;
/** Cuánto dura la salida antes de cambiar de reseña. */
const SALIDA = 340;
/** Cuánto dura la entrada de la nueva. */
const ENTRADA = 480;
/** Cuánto hay que arrastrar en el móvil para que cuente. */
const UMBRAL = 50;

/**
 * Reseñas: tres a la vez, con la del medio destacada, rotando.
 *
 * Ni la rejilla de tres iguales de antes ni el testimonio único que la
 * sustituyó. La rejilla se leía como un listado de producto y obligaba a
 * paginar de tres en tres; el testimonio único enseñaba una sola opinión,
 * y con seis había que esperar medio minuto para intuir que hay más. Con
 * tres y una que manda se ve que hay muchas sin perder el protagonista.
 *
 * La transición es de dos tiempos y no un simple cambio de texto: la actual
 * se va hacia un lado perdiendo opacidad y la siguiente entra desde el lado
 * CONTRARIO. Para eso hace falta una fase intermedia —salir, cambiar,
 * entrar—, porque con una `key` de React el nodo viejo desaparece de golpe y
 * no hay nada que animar a la salida. Son 340ms más 480ms: dentro de los
 * 700-900 que se pedían.
 *
 * El sentido importa: al pulsar "siguiente" la reseña sale hacia la
 * izquierda y la nueva llega desde la derecha, como pasar una página. Con
 * "anterior", al revés. Si siempre entrara por el mismo lado, el gesto de
 * retroceder se sentiría como avanzar.
 *
 * Sin foto, a propósito. No hay retratos reales de viajeros, y ponerlos de
 * banco de imágenes sería fingir que sí.
 *
 * Cada opinión dice de QUÉ viaje habla, y lleva a él. Antes la cita salía
 * flotando: se leía bien, pero no se sabía si quien escribía había hecho un
 * día en el Valle Sagrado o un circuito de diez. Ese dato ya estaba en la
 * reseña y el panel ya lo pedía; simplemente no se pintaba. Con la ficha
 * delante la opinión deja de ser un elogio suelto y pasa a ser la prueba de
 * algo concreto que además se puede ir a mirar.
 *
 * Las reseñas y las fichas llegan como propiedad: este componente es de
 * cliente y no puede consultar Supabase; quien lo usa es un componente de
 * servidor que lee al compilar y que ya ha comprobado que cada ficha existe.
 */
export function ReviewsSection({
  reviews,
  fichas,
}: {
  reviews: Review[];
  /** Ficha del catálogo por slug. Solo trae las que existen de verdad. */
  fichas: Record<string, { nombre: string; imagen: string; href: string }>;
}) {
  const t = useTranslations("reviews");
  /* El texto estaba fijado a `.es`: en inglés y portugués las reseñas salían
     en español aunque estuvieran traducidas en la base de datos. */
  const locale = useLocale();
  const reducido = useReducedMotion();

  const [activa, setActiva] = useState(0);
  const [quieto, setQuieto] = useState(false);
  const [fase, setFase] = useState<"quieta" | "sale" | "entra">("quieta");
  const [sentido, setSentido] = useState<1 | -1>(1);

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inicio = useRef<number | null>(null);
  const ultimoDx = useRef(0);
  const pistaRef = useRef<HTMLDivElement>(null);

  const total = reviews.length;

  const ir = useCallback(
    (salto: 1 | -1) => {
      if (total < 2) return;
      setSentido(salto);

      if (reducido) {
        /* Quien pide menos movimiento cambia de reseña sin coreografía. */
        setActiva((i) => (i + salto + total * 10) % total);
        return;
      }

      setFase("sale");
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => {
        setActiva((i) => (i + salto + total * 10) % total);
        setFase("entra");
        temporizador.current = setTimeout(() => setFase("quieta"), ENTRADA);
      }, SALIDA);
    },
    [total, reducido]
  );

  useEffect(() => {
    if (quieto || reducido || total < 2) return;
    const id = setInterval(() => ir(1), INTERVALO);
    return () => clearInterval(id);
  }, [quieto, reducido, total, ir]);

  /* Al desmontar no puede quedar vivo un temporizador que llame a `setFase`:
     React avisaría de una actualización sobre un componente que ya no está. */
  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  /* Deslizar en el móvil. El puntero no se captura al pulsar, solo cuando el
     gesto ya se movió: capturarlo antes hace que el `click` se dispare sobre
     la caja que captura y no sobre lo que hay debajo, y los botones de dentro
     dejan de responder. Y el desplazamiento se guarda en una referencia
     porque, si se soltara en el mismo fotograma del último movimiento, leer
     el estado devolvería el valor anterior y el gesto se perdería. */
  function alAgarrar(e: React.PointerEvent) {
    inicio.current = e.clientX;
    ultimoDx.current = 0;
    setQuieto(true);
  }

  function alMover(e: React.PointerEvent) {
    if (inicio.current === null) return;
    const dx = e.clientX - inicio.current;
    ultimoDx.current = dx;
    if (Math.abs(dx) > 8) {
      try {
        pistaRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* El puntero puede haberse ido ya. */
      }
    }
  }

  function alSoltar() {
    if (inicio.current === null) return;
    const dx = ultimoDx.current;
    inicio.current = null;
    ultimoDx.current = 0;
    setQuieto(false);
    if (Math.abs(dx) > UMBRAL) ir(dx < 0 ? 1 : -1);
  }

  /* La media y el recuento salen de las reseñas que hay, no de un número
     escrito a mano en las traducciones: si mañana se borra una desde el
     panel, la cifra baja sola. Un "4,9 de 5" fijo en el texto se queda
     mintiendo en cuanto cambian los datos. */
  const media = total > 0 ? reviews.reduce((n, r) => n + r.rating, 0) / total : 0;

  if (total === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#faf8f4] py-20 sm:py-28">
      <Contornos />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="escena-texto mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-600">
            {t("badge")}
          </p>
          <h2 className="mt-5 font-heading text-[2.1rem] font-bold uppercase leading-[0.95] text-slate-900 sm:text-[3.2rem]">
            {/* Cada mitad se escribe por su lado porque van en colores
                distintos, y el barrido se apoya en el color del propio
                elemento. El retraso de la segunda hace que se lean como un
                solo trazo continuo. */}
            <TextoLetras texto={t("titlePlain")} />{" "}
            <TextoLetras texto={t("titleAccent")} className="text-teal-700" retraso={620} />
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-logo text-lg leading-relaxed text-slate-600 sm:text-xl">
            {t("subtitle")}
          </p>

          {/* El dato en crudo, medido sobre las reseñas publicadas. En una
              sección que se llama "opiniones reales" la cifra tiene que
              poder comprobarse contando las fichas de abajo. */}
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="flex items-center gap-1.5 text-amber-600">
              <Star className="size-3.5 fill-current" aria-hidden />
              <span className="tabular-nums">{media.toFixed(1).replace(".", ",")}</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-slate-300" />
            <span className="tabular-nums">{t("count", { count: total })}</span>
          </p>
        </div>

        {/* Tres a la vez, con la del medio destacada.
            El testimonio protagonista funcionaba, pero enseñaba una sola
            opinión: con seis, había que esperar medio minuto para ver que
            hay más de una. Con tres se ve que hay muchas y aun así una
            manda, que es lo que se pidió.

            Las laterales se ocultan por debajo de `lg`: tres columnas en un
            móvil dejan cada cita en una tira ilegible. */}
        <div
          ref={pistaRef}
          className="mt-14 flex items-stretch justify-center gap-5 sm:mt-16"
          onMouseEnter={() => setQuieto(true)}
          onMouseLeave={() => {
            if (inicio.current === null) setQuieto(false);
          }}
          onPointerDown={alAgarrar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          style={{ touchAction: "pan-y" }}
        >
          {[-1, 0, 1].map((desplazamiento) => {
            const i = (activa + desplazamiento + total * 10) % total;
            const r = reviews[i];
            const centro = desplazamiento === 0;
            /* Solo si el slug resuelve contra el catálogo de verdad. Cinco
               de las seis reseñas apuntaban a tours inexistentes; enlazarlas
               a ciegas habría llevado a un 404 desde la sección que más
               confianza tiene que dar. */
            const ficha = r.tourSlug ? fichas[r.tourSlug] : undefined;

            return (
              <article
                /* La `key` lleva la posición y no el índice de la reseña: es
                   lo que hace que las tres cajas se queden en su sitio y solo
                   cambie su contenido. Con la `key` en el índice, React las
                   movería de columna y la animación de cambio se vería como
                   un baile. */
                key={desplazamiento}
                aria-hidden={!centro || undefined}
                /* Las laterales pasan a ser el mando del carrusel. Estaban
                   ahí para que se viera que hay más opiniones, pero no se
                   podía hacer nada con ellas: se veía la de al lado y había
                   que buscar la flecha de abajo para llegar a ella.

                   Solo con ratón, y a propósito. Son copias de la opinión
                   anterior y la siguiente, marcadas `aria-hidden`: meterlas
                   en el orden de tabulación obligaría a quien navega con
                   teclado a pasar por el mismo texto tres veces. Para eso
                   están las flechas del pie, que sí son botones con nombre
                   —y por eso el enlace de dentro sale del tabulador con
                   `tabIndex={-1}` cuando la ficha no es la del medio. */
                onClick={() => {
                  if (desplazamiento !== 0) ir(desplazamiento as 1 | -1);
                }}
                /* Las tres son la MISMA caja: mismo ancho, mismo alto y el
                   mismo cuerpo de letra. Antes la del medio era una caja
                   distinta —599px contra 289, y la cita a otro tamaño—, y
                   eso no se leía como un carrusel sino como tres piezas
                   descoordinadas. La del medio se distingue por escala,
                   sombra y opacidad: lo mismo que hace el carrusel de
                   tours, y así el relevo entre columnas es continuo. */
                className={cn(
                  "resena flex w-full flex-col rounded-[1.75rem] bg-white px-8 py-11 transition-[transform,box-shadow,opacity] duration-500 lg:w-[22rem] lg:shrink-0",
                  centro
                    ? "shadow-xl shadow-slate-900/[0.1] lg:scale-[1.06]"
                    : "hidden cursor-pointer opacity-60 shadow-lg shadow-slate-900/[0.05] hover:opacity-100 lg:flex lg:scale-[0.94]"
                )}
              >
                <div
                  className={cn(
                    "flex min-h-[15rem] flex-1 flex-col items-center justify-center text-center",
                    centro && fase === "sale" && "resena-sale",
                    centro && fase === "entra" && "resena-entraviene"
                  )}
                  style={{ ["--sentido" as string]: sentido }}
                >
                  {/* El recorte a seis líneas iguala las tres columnas sin
                      fijarles un alto: una cita larga y otra corta dejarían
                      las cajas descuadradas. */}
                  <blockquote className="resena-cita line-clamp-6 font-logo text-[17px] leading-relaxed text-slate-700 transition-colors duration-300">
                    &ldquo;{pickLocalized(r.text, locale)}&rdquo;
                  </blockquote>

                  {/* Estrellas pequeñas y discretas. Cambian de color con la
                      ficha, como todo lo demás. */}
                  <div
                    className="mt-7 flex gap-1"
                    role="img"
                    aria-label={`${r.rating} / 5`}
                  >
                    {Array.from({ length: 5 }).map((_, e) => (
                      <Star
                        key={e}
                        className={cn(
                          "size-3.5 transition-colors duration-300",
                          e < Math.round(r.rating)
                            ? "resena-estrella fill-current text-amber-500"
                            : "resena-estrella-vacia text-slate-200"
                        )}
                      />
                    ))}
                  </div>

                  <figcaption className="mt-5">
                    <p className="resena-nombre font-heading text-[15px] font-bold uppercase tracking-[0.1em] text-slate-900 transition-colors duration-300">
                      {r.name}
                    </p>
                    <p className="resena-pais mt-1 font-logo text-[15px] text-teal-700 transition-colors duration-300">
                      {r.country}
                    </p>
                  </figcaption>

                  {/* El viaje del que habla. Va al final y en pequeño: es el
                      pie de la opinión, no su titular.

                      Reserva el sitio aunque no haya ficha —las reseñas
                      generales de la agencia no la tienen— porque si no, las
                      tres cajas dejarían de medir lo mismo en cuanto una
                      reseña se quedara sin enlace, que es justo lo que se
                      pidió evitar. */}
                  {/* `w-full` y `min-w-0`: sin ellos el recorte del nombre
                      no llega a activarse. Un elemento flexible no baja de
                      su contenido por defecto, así que con un tour de nombre
                      largo la pastilla crecía por encima de la tarjeta en
                      vez de cortar el texto. Medido en el móvil: 386px de
                      pastilla dentro de una tarjeta de 343. */}
                  <div className="mt-6 flex h-9 w-full items-center justify-center">
                    {ficha && (
                      <Link
                        href={ficha.href}
                        /* La lateral entera cambia de reseña al pulsarla; sin
                           esto, pulsar su enlace haría las dos cosas. */
                        onClick={(e) => e.stopPropagation()}
                        tabIndex={centro ? undefined : -1}
                        className="resena-ficha group/f flex min-w-0 max-w-full items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1 pr-3.5 transition-colors duration-300"
                      >
                        <Image
                          src={ficha.imagen}
                          alt=""
                          width={56}
                          height={56}
                          sizes="28px"
                          className="size-7 shrink-0 rounded-full object-cover"
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

        {/* Pie: flechas discretas, el contador y la barra de avance. */}
        {total > 1 && (
          <div className="mt-10 flex items-center justify-center gap-7">
            <button
              type="button"
              onClick={() => ir(-1)}
              aria-label={t("prev")}
              className="text-slate-400 transition-colors hover:text-teal-700"
            >
              <ArrowLeft className="size-5" />
            </button>

            <p className="font-heading text-sm font-bold tabular-nums tracking-[0.14em] text-slate-500">
              <span className="text-teal-800">{String(activa + 1).padStart(2, "0")}</span>
              <span className="mx-1.5 text-slate-300">/</span>
              {String(total).padStart(2, "0")}
            </p>

            <button
              type="button"
              onClick={() => ir(1)}
              aria-label={t("next")}
              className="text-slate-400 transition-colors hover:text-teal-700"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        )}

        {total > 1 && (
          <div className="mx-auto mt-5 h-px w-full max-w-xs bg-slate-300/70">
            {/* La barra se rehace en cada cambio —la `key` lleva el índice—
                y por eso su animación arranca de cero. Se pausa sola con el
                ratón encima, igual que la rotación: si siguiera corriendo
                mientras lees, contaría un tiempo que no está pasando. */}
            <div
              key={activa}
              className={cn("resena-barra h-px bg-teal-700", quieto && "pausada")}
              style={{ animationDuration: `${INTERVALO}ms` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
