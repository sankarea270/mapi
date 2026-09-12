"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Review } from "@/data/reviews";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { pickLocalized } from "@/lib/format";
import { TextoLetras } from "@/components/home/TextoLetras";
import { cn } from "@/lib/utils";

/** Cada cuánto pasa sola. */
const INTERVALO = 5500;
/** Cuánto dura la salida antes de cambiar de reseña. */
const SALIDA = 340;
/** Cuánto dura la entrada de la nueva. */
const ENTRADA = 480;
/** Cuánto hay que arrastrar en el móvil para que cuente. */
const UMBRAL = 50;

/**
 * Reseñas: una sola, en el centro, rotando.
 *
 * Deja atrás la rejilla de tres fichas. Tres testimonios a la vez se leen
 * como un listado de producto; uno solo, grande y con aire alrededor, se lee
 * como lo que es: alguien contando su viaje. Es lo que se pidió —una pieza
 * de agencia boutique, no un panel— y de paso resuelve algo práctico: con
 * seis reseñas, la rejilla obligaba a paginar de tres en tres y nadie
 * terminaba de leer ninguna.
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
 * Las reseñas llegan como propiedad: este componente es de cliente y no
 * puede consultar Supabase; quien lo usa es un componente de servidor que
 * lee al compilar.
 */
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
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

  if (total === 0) return null;

  const r = reviews[activa];

  return (
    <section className="relative overflow-hidden bg-[#faf8f4] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="escena-texto text-center">
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
        </div>

        {/* La ficha. `resena` le da el llenado de color al pasar el ratón: un
            círculo escondido en la esquina que crece hasta cubrirla. */}
        <div
          ref={pistaRef}
          className="resena mt-14 rounded-[1.75rem] bg-white px-7 py-12 shadow-xl shadow-slate-900/[0.07] sm:mt-16 sm:px-16 sm:py-16"
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
          {/* El alto mínimo evita que la caja dé un salto al pasar de una
              reseña corta a una larga, que es lo que rompe la sensación de
              que el texto se cambia solo. */}
          <div
            className={cn(
              "flex min-h-[13rem] flex-col items-center justify-center text-center sm:min-h-[11rem]",
              fase === "sale" && "resena-sale",
              fase === "entra" && "resena-entraviene"
            )}
            style={{ ["--sentido" as string]: sentido }}
          >
            <blockquote className="resena-cita max-w-2xl font-logo text-xl leading-relaxed text-slate-700 transition-colors duration-300 sm:text-[1.6rem] sm:leading-[1.55]">
              &ldquo;{pickLocalized(r.text, locale)}&rdquo;
            </blockquote>

            {/* Estrellas pequeñas y discretas, como se pidió. Se quedan en
                ámbar: una estrella dorada se reconoce como valoración sin
                leer nada. */}
            <div
              className="mt-8 flex gap-1"
              role="img"
              aria-label={`${r.rating} / 5`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < Math.round(r.rating)
                      ? "fill-current text-amber-500"
                      : "text-slate-200"
                  )}
                />
              ))}
            </div>

            <figcaption className="mt-5">
              <p className="resena-nombre font-heading text-base font-bold uppercase tracking-[0.1em] text-slate-900 transition-colors duration-300">
                {r.name}
              </p>
              <p className="resena-pais mt-1 font-logo text-[15px] text-teal-700 transition-colors duration-300">
                {r.country}
              </p>
            </figcaption>
          </div>
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
