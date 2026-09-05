import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CREDENTIALS } from "@/data/credentials";
import { pickLocalized } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Avales oficiales del sector turismo.
 *
 * Dos presentaciones sobre los mismos datos:
 *  - "strip": tira compacta para el inicio, solo los logos.
 *  - "grid":  rejilla con el nombre y el organismo, para la página "Nosotros".
 *
 * Los logos van a color y no en escala de grises: son sellos oficiales y su
 * valor está justo en que se reconozcan. La rejilla se separa con filetes en
 * lugar de tarjetas con sombra, para no competir con los propios logos.
 *
 * Componente de servidor y CSS puro: la aparición escalonada no necesita
 * JavaScript, y así los sellos se ven aunque el script falle.
 */
export async function Credentials({
  variant = "grid",
  locale,
}: {
  variant?: "strip" | "grid";
  locale: string;
}) {
  const t = await getTranslations("credentials");
  const l = locale as "es" | "en" | "pt";

  if (variant === "strip") {
    return (
      /* Cierra la portada, así que se le da aire de sección y no de tira
         apretada: es la última impresión antes del pie, y quien llega aquí
         ya está decidiendo si confía. Antes eran 10 de padding y los sellos
         a 44px, lo que la dejaba como un pie de página adelantado. */
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="escena-texto mx-auto max-w-2xl text-center">
            <p className="eyebrow text-teal-700">{t("badge")}</p>
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-[2.1rem] sm:leading-tight">
              {t("title")}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
              {t("lead")}
            </p>
          </div>

          {/* Los sellos van sobre blanco y separados por filete: destacan
              del fondo gris de la sección y se leen como una fila de
              credenciales, no como logos sueltos flotando. */}
          {/* Cuatro columnas porque son cuatro sellos: con cinco quedaba una
              celda vacía al final. Los filetes se hacen con `gap-px` sobre
              fondo gris y no con `border-r`, que dejaba el borde descolgado
              en el último elemento de cada fila al cambiar de columnas. */}
          <ul className="escena-foto mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200 sm:mt-14 sm:grid-cols-4">
            {CREDENTIALS.map((c) => (
              <li
                key={c.file}
                className="flex items-center justify-center bg-white px-6 py-8 sm:px-8 sm:py-10"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${c.file}`}
                  alt={`${c.name} — ${pickLocalized(c.label, l)}`}
                  width={c.width}
                  height={c.height}
                  sizes="240px"
                  /* Alto fijo y ancho automático: los cinco sellos tienen
                     proporciones muy distintas y así quedan ópticamente
                     igualados en la fila. */
                  className="h-14 w-auto object-contain sm:h-16 lg:h-20"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
      {CREDENTIALS.map((c, i) => (
        <li
          key={c.file}
          style={{ ["--i" as string]: i }}
          className={cn(
            "rise-in border-t-2 border-slate-900 pt-6",
            "flex flex-col gap-5"
          )}
        >
          <div className="flex h-16 items-center">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${c.file}`}
              alt=""
              width={c.width}
              height={c.height}
              sizes="200px"
              className="max-h-16 w-auto object-contain"
            />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              {c.name}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {pickLocalized(c.label, l)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
