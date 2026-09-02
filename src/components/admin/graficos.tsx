"use client";

import { useState } from "react";
import type { FilaReserva } from "@/types/db";

/*
 * Gráficos del resumen.
 *
 * Se dibujan con HTML y CSS, sin librería: son dos formas sencillas y meter
 * una dependencia de gráficos costaría más kilobytes que todo el panel.
 *
 * Color: una sola serie, así que no hay identidades que distinguir y basta
 * un tono. Es #07908c, un verde azulado de la familia del logotipo pero más
 * saturado: el color de marca (#036564) tiene un croma de 0.078 y como
 * relleno de gráfico se lee gris apagado. Este pasa las comprobaciones de
 * banda de luminosidad, croma y contraste sobre blanco y sobre el gris del
 * panel.
 *
 * Sin leyenda: con una sola serie, el título ya dice qué se está mirando.
 */

const SERIE = "#07908c";
const REJILLA = "#e1e0d9";

/** Lunes de la semana a la que pertenece la fecha, a medianoche. */
function inicioDeSemana(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  /* getDay() da 0 el domingo; se convierte para que la semana empiece en
     lunes, que es como se lee un calendario aquí. */
  const desplazamiento = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - desplazamiento);
  return x;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function etiquetaFecha(d: Date): string {
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function BarrasSemana({
  reservas,
  semanas = 8,
}: {
  reservas: FilaReserva[];
  semanas?: number;
}) {
  const [encima, setEncima] = useState<number | null>(null);

  const hoy = new Date();
  const primera = inicioDeSemana(hoy);
  primera.setDate(primera.getDate() - (semanas - 1) * 7);

  const cubos = Array.from({ length: semanas }, (_, i) => {
    const desde = new Date(primera);
    desde.setDate(desde.getDate() + i * 7);
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 7);
    return { desde, hasta, valor: 0 };
  });

  for (const r of reservas) {
    const t = new Date(r.created_at).getTime();
    const cubo = cubos.find((c) => t >= c.desde.getTime() && t < c.hasta.getTime());
    if (cubo) cubo.valor++;
  }

  const maximo = Math.max(...cubos.map((c) => c.valor));

  /* Ocho columnas a cero no son un gráfico, son una caja vacía que confunde.
     Mientras no haya datos se dice por qué. */
  if (maximo === 0) {
    return (
      <div className="flex h-44 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 px-6 text-center">
        <p className="text-sm text-slate-500">Sin solicitudes en las últimas {semanas} semanas.</p>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400">
          Este gráfico se irá llenando solo a medida que la gente use el formulario de reservas
          de la web.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Escala. Sin ella la barra más alta podría ser 3 o 300: la altura
          relativa se ve, la magnitud no. Solo dos marcas —el máximo y el
          cero—, que es lo que hace falta para situar el resto. */}
      <div
        aria-hidden
        className="flex h-44 w-6 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums leading-none text-slate-400"
      >
        <span>{maximo}</span>
        <span>0</span>
      </div>

      <div className="min-w-0 flex-1">
      <div className="relative flex h-44 items-end gap-1">
        {/* Rejilla al fondo, discreta: sitúa la altura sin competir con las
            barras. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-px w-full" style={{ background: REJILLA }} />
          ))}
        </div>

        {cubos.map((c, i) => {
          const alto = (c.valor / maximo) * 100;
          const activo = encima === i;
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setEncima(i)}
              onMouseLeave={() => setEncima(null)}
              onFocus={() => setEncima(i)}
              onBlur={() => setEncima(null)}
              tabIndex={0}
            >
              {activo && (
                <div className="pointer-events-none absolute inset-x-0 bottom-full z-10 mb-2 flex justify-center">
                  <div className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                    <span className="font-bold tabular-nums">{c.valor}</span>{" "}
                    {c.valor === 1 ? "solicitud" : "solicitudes"}
                    <span className="ml-2 text-white/50">
                      sem. {etiquetaFecha(c.desde)}
                    </span>
                  </div>
                </div>
              )}
              <div
                className="w-full transition-[filter] duration-150"
                style={{
                  height: `${Math.max(alto, c.valor > 0 ? 3 : 0)}%`,
                  background: SERIE,
                  /* Extremo redondeado arriba y recto en la base: la barra
                     nace del eje, no flota. */
                  borderRadius: "4px 4px 0 0",
                  filter: activo ? "brightness(0.88)" : undefined,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Solo la primera y la última fecha: una etiqueta bajo cada columna
          sería ruido con ocho columnas estrechas. */}
      <div className="mt-2 flex justify-between border-t pt-2 text-xs tabular-nums text-slate-400" style={{ borderColor: REJILLA }}>
        <span>{etiquetaFecha(cubos[0].desde)}</span>
        <span>{etiquetaFecha(cubos[cubos.length - 1].desde)}</span>
      </div>
      </div>
    </div>
  );
}

export function BarrasCategoria({
  datos,
}: {
  datos: Array<{ etiqueta: string; valor: number }>;
}) {
  if (datos.length === 0) {
    return <p className="py-6 text-sm text-slate-500">Todavía no hay tours publicados.</p>;
  }

  const maximo = Math.max(...datos.map((d) => d.valor));

  return (
    <ul className="space-y-2.5">
      {datos.map((d) => (
        <li key={d.etiqueta} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3">
          <span className="truncate text-sm text-slate-600" title={d.etiqueta}>
            {d.etiqueta}
          </span>
          <div className="h-5 rounded-sm bg-slate-100">
            <div
              className="h-5"
              style={{
                width: `${(d.valor / maximo) * 100}%`,
                background: SERIE,
                borderRadius: "0 4px 4px 0",
              }}
            />
          </div>
          {/* Etiqueta directa en cada fila: son pocas y el número es el dato,
              así que no hace falta pasar el ratón para leerlo. */}
          <span className="text-right text-sm font-semibold tabular-nums text-slate-900">
            {d.valor}
          </span>
        </li>
      ))}
    </ul>
  );
}
