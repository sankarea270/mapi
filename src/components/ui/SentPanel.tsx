"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/**
 * Confirmación tras enviar un formulario.
 *
 * Sustituye al formulario en su sitio, en lugar de aparecer como aviso
 * flotante: así queda claro que el paso terminó y no se puede enviar dos
 * veces por error.
 *
 * Recibe el foco al montarse y se anuncia con `role="status"`, porque quien
 * navega con teclado o lector de pantalla no ve que la pantalla ha cambiado.
 */
export function SentPanel({
  url,
  summary,
  onReset,
}: {
  url: string;
  /** Pares etiqueta/valor de lo que se envía. */
  summary: Array<[string, string]>;
  onReset: () => void;
}) {
  const t = useTranslations("sent");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="px-6 py-10 outline-none sm:px-9"
    >
      <p className="eyebrow text-teal-700">{t("title")}</p>
      <p className="mt-3 max-w-md text-[17px] leading-relaxed text-slate-700">
        {t("body")}
      </p>

      {summary.length > 0 && (
        <dl className="mt-8 border-t border-slate-200">
          {summary.map(([label, value]) => (
            <div
              key={label}
              /* Apilado en móvil: a dos columnas, la etiqueta se comía el
                 ancho y el valor se partía en varias líneas. */
              className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4"
            >
              <dt className="eyebrow text-slate-400">{label}</dt>
              <dd className="text-[15px] text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-amber-500 px-7 py-3 text-sm font-bold tracking-wide text-slate-900 transition-colors hover:bg-amber-400"
        >
          {t("open")}
        </a>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-slate-300 px-7 py-3 text-sm font-bold tracking-wide text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
        >
          {t("again")}
        </button>
      </div>

      <p className="mt-5 max-w-md text-xs leading-relaxed text-slate-500">
        {t("blocked")}
      </p>
    </div>
  );
}
