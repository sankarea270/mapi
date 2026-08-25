import { cn } from "@/lib/utils";

/**
 * Precio con tratamiento tipográfico.
 *
 * `Intl.NumberFormat` devuelve la cifra y la moneda en una sola cadena
 * ("550 US$"), que renderizada tal cual queda plana: el símbolo pesa lo mismo
 * que el número. Aquí se separan con `formatToParts` para poder componerlos:
 * la cifra manda —grande, en versalitas de caja alta del tipo de titulares y
 * con tracking cerrado— y la moneda queda pequeña y elevada, como en una
 * etiqueta de precio impresa.
 *
 * Los números van en `tabular-nums`: sin eso las cifras cambian de ancho
 * entre tours y las columnas de precios bailan.
 */

interface PriceProps {
  amount: number;
  locale: string;
  currency?: string;
  /** Tamaño relativo dentro de su contexto. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Etiqueta corta antes de la cifra ("desde"). */
  prefix?: string;
  /** Texto tras la cifra ("/ persona"). */
  suffix?: string;
  className?: string;
  /** Sobre fondo oscuro invierte los tonos secundarios. */
  onDark?: boolean;
}

/*
 * El símbolo se alinea a la BASE y se sube desde ahí, en em de su propio
 * cuerpo, hasta quedar a la altura de mayúscula de la cifra. Alinearlo con
 * `self-start` lo pegaba al tope de la caja de línea, que en una cifra de
 * 3rem es altísima, y el símbolo quedaba flotando suelto muy por encima.
 */
const SIZES = {
  sm: { amount: "text-lg", symbol: "text-[0.62em]", gap: "gap-1", lift: "-translate-y-[0.43em]" },
  md: { amount: "text-2xl", symbol: "text-[0.54em]", gap: "gap-1.5", lift: "-translate-y-[0.6em]" },
  lg: { amount: "text-[2rem]", symbol: "text-[0.46em]", gap: "gap-1.5", lift: "-translate-y-[0.83em]" },
  xl: { amount: "text-[3.1rem]", symbol: "text-[0.4em]", gap: "gap-2", lift: "-translate-y-[1.05em]" },
} as const;

export function Price({
  amount,
  locale,
  currency = "USD",
  size = "md",
  prefix,
  suffix,
  className,
  onDark = false,
}: PriceProps) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).formatToParts(amount);

  const symbol = parts
    .filter((p) => p.type === "currency")
    .map((p) => p.value)
    .join("");
  const figure = parts
    .filter((p) => p.type !== "currency" && p.type !== "literal")
    .map((p) => p.value)
    .join("");

  const s = SIZES[size];

  return (
    <span className={cn("inline-flex items-baseline", s.gap, className)}>
      {prefix && (
        <span
          className={cn(
            "eyebrow self-center",
            onDark ? "text-slate-300" : "text-slate-400"
          )}
        >
          {prefix}
        </span>
      )}
      <span
        className={cn(
          "font-heading font-bold leading-none tracking-[-0.03em] tabular-nums",
          s.amount
        )}
      >
        {figure}
      </span>
      {/* Moneda elevada y en versalita: acompaña sin competir con la cifra. */}
      <span
        className={cn(
          "self-baseline font-bold uppercase tracking-[0.08em]",
          s.symbol,
          s.lift,
          onDark ? "text-amber-400" : "text-amber-600"
        )}
      >
        {symbol}
      </span>
      {suffix && (
        <span
          className={cn(
            "self-baseline text-sm",
            onDark ? "text-slate-300" : "text-slate-500"
          )}
        >
          {suffix}
        </span>
      )}
    </span>
  );
}
