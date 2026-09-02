"use client";

import { cn } from "@/lib/utils";

/*
 * Piezas de formulario del panel.
 *
 * Mismo lenguaje visual que la web pública: filete inferior, rótulo en
 * versalita y nada de iconos dentro del campo. Se repite aquí en vez de
 * importarlo de los formularios públicos porque aquel es un formulario de
 * captación y este es una herramienta de trabajo: densidades distintas.
 */

export const IDIOMAS = [
  { id: "es", etiqueta: "Español" },
  { id: "en", etiqueta: "English" },
  { id: "pt", etiqueta: "Português" },
] as const;

export type Idioma = (typeof IDIOMAS)[number]["id"];

const base =
  "w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-[15px] text-slate-900 placeholder:text-slate-300 outline-none transition-colors focus:border-teal-500 disabled:text-slate-400";

export function Campo({
  etiqueta,
  valor,
  onChange,
  tipo = "text",
  placeholder,
  ayuda,
  error,
  className,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  tipo?: string;
  placeholder?: string;
  ayuda?: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow text-slate-400">{etiqueta}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(base, error && "border-red-400")}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : ayuda ? (
        <span className="mt-1 block text-xs text-slate-400">{ayuda}</span>
      ) : null}
    </label>
  );
}

export function Area({
  etiqueta,
  valor,
  onChange,
  filas = 3,
  placeholder,
  ayuda,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  filas?: number;
  placeholder?: string;
  ayuda?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-slate-400">{etiqueta}</span>
      <textarea
        rows={filas}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(base, "resize-y")}
      />
      {ayuda && <span className="mt-1 block text-xs text-slate-400">{ayuda}</span>}
    </label>
  );
}

/**
 * Selector del idioma que se está editando.
 *
 * La alternativa —tres campos apilados por cada texto— multiplica por tres
 * la altura del formulario y hace imposible ver un tour de un vistazo. Con
 * esto se edita un idioma cada vez y el punto avisa de lo que falta.
 */
export function SelectorIdioma({
  idioma,
  onChange,
  completado,
}: {
  idioma: Idioma;
  onChange: (i: Idioma) => void;
  completado?: Record<Idioma, boolean>;
}) {
  return (
    <div className="flex overflow-hidden rounded-md ring-1 ring-slate-200">
      {IDIOMAS.map((l) => {
        const activo = idioma === l.id;
        const falta = completado && !completado[l.id];
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            aria-pressed={activo}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-r border-slate-200 px-3 py-2 text-xs font-semibold transition-colors last:border-r-0",
              activo ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            {l.etiqueta}
            {falta && (
              <span
                className="size-1.5 rounded-full bg-amber-500"
                title="Sin traducir"
                aria-label="Sin traducir"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Boton({
  children,
  onClick,
  tipo = "button",
  variante = "primario",
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tipo?: "button" | "submit";
  variante?: "primario" | "neutro" | "peligro";
  disabled?: boolean;
  className?: string;
}) {
  const estilos = {
    primario: "bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400",
    neutro: "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
    peligro: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
  }[variante];

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md px-4 py-2.5 text-sm font-bold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed",
        estilos,
        className
      )}
    >
      {children}
    </button>
  );
}

export function Etiqueta({ estado }: { estado: string }) {
  const mapa: Record<string, string> = {
    published: "bg-teal-50 text-teal-700 ring-teal-200",
    draft: "bg-slate-100 text-slate-500 ring-slate-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-teal-50 text-teal-700 ring-teal-200",
    cancelled: "bg-red-50 text-red-600 ring-red-200",
    completed: "bg-slate-100 text-slate-500 ring-slate-200",
  };
  const texto: Record<string, string> = {
    published: "Publicado",
    draft: "Borrador",
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        mapa[estado] ?? mapa.draft
      )}
    >
      {texto[estado] ?? estado}
    </span>
  );
}
