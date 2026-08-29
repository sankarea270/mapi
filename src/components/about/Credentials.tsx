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
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="eyebrow text-center text-teal-700">{t("badge")}</p>
          <h2 className="mt-2 text-center font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {t("title")}
          </h2>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16">
            {CREDENTIALS.map((c, i) => (
              <li
                key={c.file}
                style={{ ["--i" as string]: i }}
                className="rise-in"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${c.file}`}
                  alt={`${c.name} — ${pickLocalized(c.label, l)}`}
                  width={c.width}
                  height={c.height}
                  sizes="180px"
                  /* Alto fijo y ancho automático: los cinco sellos tienen
                     proporciones muy distintas y así quedan ópticamente
                     igualados en la fila. */
                  className="h-11 w-auto object-contain sm:h-14"
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
