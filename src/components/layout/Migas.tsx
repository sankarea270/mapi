import { ChevronRight, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { breadcrumbList, type Miga } from "@/lib/jsonld";

/**
 * Migas de pan: «Inicio › Destinos › Cusco».
 *
 * Hacen dos cosas a la vez, y por eso van juntas en un solo componente: se
 * ven —para quien llegó a una ficha desde Google y necesita subir un nivel
 * sin pasar por el menú— y se declaran como BreadcrumbList, que es lo que
 * permite a Google pintar la ruta en el resultado en vez de la URL. Que la
 * lista visible y la declarada sean la misma cosa evita que se desfasen.
 *
 * Sustituye al «← Volver a destinos» de las cabeceras: ese enlace solo subía
 * un nivel y no decía dónde estabas. Las migas suben a cualquier nivel.
 */
export async function Migas({
  migas,
  locale,
  sobreFoto = false,
  className,
}: {
  /** Sin «Inicio»: se antepone solo. La última es la página actual. */
  migas: Miga[];
  locale: string;
  /** Sobre una fotografía oscura: letra clara y sombra. */
  sobreFoto?: boolean;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const todas: Miga[] = [{ nombre: t("home"), ruta: "/" }, ...migas];

  return (
    <>
      <nav aria-label={t("breadcrumb")} className={className}>
        <ol
          className={cn(
            "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold sm:text-sm",
            sobreFoto ? "text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0/0.55)]" : "text-slate-500"
          )}
        >
          {todas.map((m, i) => {
            const ultima = i === todas.length - 1;
            return (
              <li key={`${m.nombre}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight
                    aria-hidden
                    className={cn("size-3.5 shrink-0", sobreFoto ? "text-white/60" : "text-slate-300")}
                  />
                )}
                {ultima ? (
                  <span aria-current="page" className={sobreFoto ? "text-white" : "text-slate-800"}>
                    {m.nombre}
                  </span>
                ) : (
                  <Link
                    href={m.ruta ?? "/"}
                    className={cn(
                      "inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:underline",
                      sobreFoto ? "hover:text-amber-300" : "hover:text-teal-700"
                    )}
                  >
                    {i === 0 && <Home aria-hidden className="size-3.5" />}
                    {m.nombre}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {/* La miga actual va sin `item`: es la página en la que está el robot. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbList(
              todas.map((m, i) => (i === todas.length - 1 ? { nombre: m.nombre } : m)),
              locale
            )
          ).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

/**
 * Solo la declaración, sin la lista visible: para las páginas de primer nivel
 * («Destinos», «Guía»…), donde una fila «Inicio › Destinos» sobre el título
 * sobraría, pero Google sí saca partido de saber dónde cuelgan.
 */
export async function MigasJsonLd({ migas, locale }: { migas: Miga[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const todas: Miga[] = [{ nombre: t("home"), ruta: "/" }, ...migas];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          breadcrumbList(
            todas.map((m, i) => (i === todas.length - 1 ? { nombre: m.nombre } : m)),
            locale
          )
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}
