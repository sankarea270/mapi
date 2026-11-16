"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Calendario del panel de reserva, en línea y en el idioma de la página.
 *
 * El DatePicker general tiene los meses y los días escritos en español, así
 * que en la ficha en inglés o portugués se leía «Diciembre» y «Lu Ma Mi».
 * Este los saca de `Intl` según el idioma. Va dentro del panel y no como
 * desplegable flotante: el panel es fijo al hacer scroll y tiene altura
 * limitada, y un desplegable quedaba cortado por abajo.
 *
 * Las fechas viajan como texto «AAAA-MM-DD» y se construyen con año, mes y
 * día locales: `new Date("2026-12-14")` se interpreta en UTC y en Perú
 * (UTC-5) caía en el día anterior.
 */

export const aTexto = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const deTexto = (s: string) => {
  const [a, m, d] = s.split("-").map(Number);
  return new Date(a, m - 1, d);
};

export function CalendarioReserva({
  valor,
  onCambio,
  locale,
  minimo,
  etiquetas,
}: {
  valor: string;
  onCambio: (fecha: string) => void;
  locale: string;
  /** Primer día que se puede elegir («AAAA-MM-DD»). */
  minimo: string;
  etiquetas: { anterior: string; siguiente: string };
}) {
  const inicio = deTexto(valor || minimo);
  const [vista, setVista] = useState({ anio: inicio.getFullYear(), mes: inicio.getMonth() });
  const min = deTexto(minimo);

  const nombreMes = useMemo(() => {
    const texto = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
      new Date(vista.anio, vista.mes, 1)
    );
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }, [locale, vista]);

  /* Lunes primero, como se usa en Perú y en Europa. El 1 de enero de 2024
     fue lunes: de ahí salen los siete nombres en el idioma de la página. */
  const diasSemana = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2024, 0, 1 + i))
      ),
    [locale]
  );
  const formatoLargo = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }),
    [locale]
  );

  const diasMes = new Date(vista.anio, vista.mes + 1, 0).getDate();
  const huecos = (new Date(vista.anio, vista.mes, 1).getDay() + 6) % 7;
  const enMesMinimo = vista.anio === min.getFullYear() && vista.mes === min.getMonth();

  const mover = (delta: number) =>
    setVista((v) => {
      const d = new Date(v.anio, v.mes + delta, 1);
      return { anio: d.getFullYear(), mes: d.getMonth() };
    });

  return (
    <div className="select-none">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => mover(-1)}
          disabled={enMesMinimo}
          aria-label={etiquetas.anterior}
          className="grid size-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <p aria-live="polite" className="font-heading text-[15px] font-bold tracking-wide text-slate-900">
          {nombreMes}
        </p>
        <button
          type="button"
          onClick={() => mover(1)}
          aria-label={etiquetas.siguiente}
          className="grid size-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center">
        {diasSemana.map((d, i) => (
          <span key={i} aria-hidden className="py-1 text-[11px] font-semibold uppercase text-slate-400">
            {d}
          </span>
        ))}
        {Array.from({ length: huecos }).map((_, i) => (
          <span key={`h${i}`} aria-hidden />
        ))}
        {Array.from({ length: diasMes }).map((_, i) => {
          const fecha = new Date(vista.anio, vista.mes, i + 1);
          const texto = aTexto(fecha);
          const pasado = fecha < min;
          const elegido = texto === valor;
          return (
            <span key={texto} className="flex justify-center py-px">
              <button
                type="button"
                disabled={pasado}
                onClick={() => onCambio(texto)}
                aria-pressed={elegido}
                aria-label={formatoLargo.format(fecha)}
                className={cn(
                  "grid size-8 place-items-center rounded-full text-[13px] tabular-nums transition-colors",
                  pasado && "cursor-default text-slate-300",
                  !pasado && !elegido && "font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800",
                  elegido && "bg-slate-900 font-bold text-white shadow-md shadow-slate-900/25"
                )}
              >
                {i + 1}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
