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
export function FranjaDatos({ datos, className }: { datos: DatoFicha[]; className?: string }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-4",
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
