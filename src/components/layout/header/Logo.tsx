"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

/**
 * Logotipo: pin de marca y palabra.
 *
 * La palabra va en romana clásica y el subtítulo en versalitas muy
 * espaciadas, siguiendo la referencia de "Perú Travel · TOUR OPERATOR".
 * Antes iba en la misma tipografía de titulares —una grotesca geométrica—
 * y el conjunto se leía como una web más; la romana da el aire de agencia
 * con oficio que la marca quiere.
 *
 * "GoTo" en blanco o petróleo y "Mapi" en ámbar: son los dos colores del
 * pin, así que la palabra y el dibujo se leen como una sola pieza.
 */
export function Logo({
  light = false,
  compact = false,
  centrado = false,
}: {
  light?: boolean;
  compact?: boolean;
  /** Pin arriba y palabra debajo, para la cabecera con el logo centrado. */
  centrado?: boolean;
}) {
  const t = useTranslations("brand");

  return (
    <Link
      href="/"
      className={cn(
        "group flex shrink-0 items-center",
        centrado ? "flex-col gap-1.5" : "gap-2.5"
      )}
    >
      {/* Solo el pin del logo: la pieza completa lleva el rótulo "GoToMapi
          PERÚ" dentro y, a tamaño de cabecera, ese texto quedaría ilegible y
          además duplicaría el nombre que va al lado. */}
      <div
        className={cn(
          "relative shrink-0 transition-transform duration-300 group-hover:-rotate-3",
          centrado ? "size-11" : "size-16"
        )}
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/gotomapi-mark.webp`}
          alt="GoToMapi Perú"
          fill
          sizes="64px"
          className="object-contain"
          priority
        />
      </div>

      <span className={cn("leading-none", centrado && "text-center")}>
        <span
          className={cn(
            "block font-logo font-medium tracking-tight transition-colors",
            centrado ? "text-[1.6rem]" : "text-2xl",
            light ? "text-white" : "text-slate-900"
          )}
        >
          {siteConfig.name}
          {/* Sin espacio: en el logotipo es una sola palabra. */}
          <span className="text-amber-500">{siteConfig.nameSuffix}</span>
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-1 block text-[9px] font-semibold uppercase tracking-[0.34em] transition-colors",
              light ? "text-white/55" : "text-slate-400"
            )}
          >
            {t("tagline")}
          </span>
        )}
      </span>
    </Link>
  );
}
