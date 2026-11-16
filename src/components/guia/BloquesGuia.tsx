import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import type { LocalizedText } from "@/types/tour";

/*
 * Piezas de las guías de destino y de experiencia: presentación, lugares con
 * su tour y preguntas frecuentes.
 *
 * Nacieron dentro de la página de destino; al dar contenido también a las
 * experiencias (Search Console las tenía en «Rastreada: actualmente sin
 * indexar» con 40 palabras cada una) se sacaron aquí para que las dos
 * páginas se vean y se marquen igual, y un cambio no tenga que hacerse dos
 * veces.
 */

export interface LugarGuia {
  nombre: LocalizedText;
  texto: LocalizedText;
  /** Dirección de un tour nuestro relacionado. Si deja de existir, el enlace no se pinta. */
  tour?: string;
}

export interface PreguntaGuia {
  pregunta: LocalizedText;
  respuesta: LocalizedText;
}

/** Presentación: el primer párrafo, más grande, hace de entradilla. */
export function Presentacion({ parrafos, locale }: { parrafos: LocalizedText[]; locale: string }) {
  if (parrafos.length === 0) return null;
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <p className="font-logo text-xl leading-relaxed text-slate-700 sm:text-[1.4rem] sm:leading-relaxed">
          {pickLocalized(parrafos[0], locale)}
        </p>
        {parrafos.slice(1).map((parrafo, i) => (
          <p key={i} className="mt-5 text-base leading-relaxed text-slate-600">
            {pickLocalized(parrafo, locale)}
          </p>
        ))}
      </div>
    </section>
  );
}

export function Lugares({
  titulo,
  lugares,
  locale,
  existentes,
  verTour,
}: {
  titulo: string;
  lugares: LugarGuia[];
  locale: string;
  /** Slugs de los tours publicados hoy. */
  existentes: Set<string>;
  verTour: string;
}) {
  return (
    <>
      <h3 className="mt-10 font-heading text-xl font-bold text-slate-900 sm:text-2xl">{titulo}</h3>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lugares.map((lugar) => (
          <li
            key={lugar.nombre.es}
            className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <p className="font-heading text-lg font-bold text-slate-900">
              {pickLocalized(lugar.nombre, locale)}
            </p>
            {/* `text-left`: en una tarjeta tan estrecha el justificado de la
                web abría huecos grandes entre palabras. */}
            <p className="mt-2 flex-1 text-left text-[15px] leading-relaxed text-slate-600">
              {pickLocalized(lugar.texto, locale)}
            </p>
            {lugar.tour && existentes.has(lugar.tour) && (
              <Link
                href={`/tours/${lugar.tour}`}
                className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-teal-700 transition-colors hover:text-teal-900"
              >
                {verTour}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Un apartado de texto corrido con su título («Cuándo ir», «Consejos»…). */
export function Apartado({
  titulo,
  parrafos,
  locale,
}: {
  titulo: string;
  parrafos: LocalizedText[];
  locale: string;
}) {
  return (
    <div>
      <h3 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl">{titulo}</h3>
      {parrafos.map((parrafo, i) => (
        <p key={i} className="mt-4 text-base leading-relaxed text-slate-600">
          {pickLocalized(parrafo, locale)}
        </p>
      ))}
    </div>
  );
}

/*
 * `<details>` y no un acordeón de JavaScript: la respuesta está en el HTML
 * desde el principio, plegada, y Google la lee.
 */
export function Preguntas({
  titulo,
  preguntas,
  locale,
}: {
  titulo: string;
  preguntas: PreguntaGuia[];
  locale: string;
}) {
  if (preguntas.length === 0) return null;
  return (
    <>
      <h3 className="mt-14 font-heading text-xl font-bold text-slate-900 sm:text-2xl">{titulo}</h3>
      <div className="mt-6 max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
        {preguntas.map((p) => (
          <details key={p.pregunta.es} className="group py-1">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 font-heading text-[17px] font-bold leading-snug text-slate-900 transition-colors hover:text-teal-700 [&::-webkit-details-marker]:hidden">
              {pickLocalized(p.pregunta, locale)}
              <ChevronDown
                className="mt-0.5 size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden
              />
            </summary>
            <p className="pb-5 pr-10 text-[15px] leading-relaxed text-slate-600">
              {pickLocalized(p.respuesta, locale)}
            </p>
          </details>
        ))}
      </div>
    </>
  );
}

export interface EnlaceGuia {
  href: string;
  nombre: string;
  imagen: string;
}

/*
 * Tarjetas pequeñas con foto hacia otras páginas (destinos cercanos,
 * experiencias). Colca, Manu, Nazca y las seis experiencias solo recibían un
 * enlace en toda la web —el de su listado— y Google las dejaba en
 * «Descubierta: actualmente sin indexar»: entiende que lo poco enlazado
 * importa poco.
 */
export function TarjetasEnlace({ titulo, enlaces }: { titulo: string; enlaces: EnlaceGuia[] }) {
  if (enlaces.length === 0) return null;
  return (
    <div>
      {/* h2: va en su propia sección, fuera de la guía. */}
      <h2 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{titulo}</h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-xl bg-neutral-900"
            >
              {/* `alt` vacío: el nombre ya va escrito encima de la foto. */}
              <Image
                src={e.imagen}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="relative p-3 font-heading text-base font-bold leading-tight text-white sm:text-lg">
                {e.nombre}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** FAQPage con las mismas preguntas que se ven en la página, que es lo que pide Google. */
export function preguntasLd(preguntas: PreguntaGuia[], locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((p) => ({
      "@type": "Question",
      name: pickLocalized(p.pregunta, locale),
      acceptedAnswer: { "@type": "Answer", text: pickLocalized(p.respuesta, locale) },
    })),
  };
}
