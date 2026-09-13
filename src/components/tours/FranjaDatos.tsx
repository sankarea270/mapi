import { cn } from "@/lib/utils";

export interface DatoFicha {
  icono: React.ReactNode;
  rotulo: string;
  valor: string;
}

/**
 * Franja de datos rápidos de la ficha: duración, tipo, tamaño de grupo,
 * idiomas.
 *
 * Sobre los iconos. En su día se quitaron de esta ficha las cajas con icono
 * —cuadrado de color, pictograma dentro— porque son el sello de las
 * plantillas: el icono repetía lo que el rótulo ya decía y solo añadía ruido.
 * Estos no son aquello: van a trazo fino, en gris, del tamaño del texto y sin
 * fondo. Ayudan a localizar el dato de un vistazo sin pedir protagonismo.
 *
 * Se separan con filete y no con tarjetas para que la franja se lea como una
 * sola pieza, igual que la ficha técnica de una revista.
 */
/* Columnas según los datos que haya. Las casillas salen de la ficha y la
   que no tiene dato no se pinta, así que puede haber dos, tres o cuatro; con
   las columnas fijas a cuatro sobraba un hueco gris al final. Clases
   escritas enteras para que Tailwind las encuentre. */
const COLUMNAS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function FranjaDatos({ datos, className }: { datos: DatoFicha[]; className?: string }) {
  return (
    <dl
      className={cn(
        "grid gap-px overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200",
        datos.length === 3 ? "grid-cols-1" : "grid-cols-2",
        COLUMNAS[Math.min(4, datos.length)],
        className
      )}
    >
      {datos.map((d, i) => (
        <div
          key={d.rotulo}
          style={{ ["--i" as string]: i }}
          className="rise-in bg-white px-5 py-4"
        >
          <dt className="flex items-center gap-2 text-slate-400">
            <span className="[&>svg]:size-4 [&>svg]:stroke-[1.5]">{d.icono}</span>
            <span className="eyebrow">{d.rotulo}</span>
          </dt>
          <dd className="mt-2 font-heading text-[15px] font-bold leading-snug text-slate-900">
            {d.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
