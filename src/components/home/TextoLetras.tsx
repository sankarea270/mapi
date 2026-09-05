import { cn } from "@/lib/utils";

/**
 * Titular cuyas letras entran en orden al bajar el scroll.
 *
 * Cada letra es un tramo de scroll distinto: la primera termina su entrada
 * cuando la última empieza la suya, de modo que el titular se escribe solo
 * a medida que se baja.
 *
 * Tres decisiones que hacen que esto no rompa nada:
 *
 *  · Se parte por PALABRAS y, dentro de cada palabra, por letras. Partir
 *    directamente por letras obliga a poner cada una en un `inline-block`,
 *    y entonces el navegador puede cortar el renglón en mitad de una
 *    palabra. Agrupando primero por palabras, el salto de línea sigue
 *    ocurriendo donde debe.
 *
 *  · El texto completo va en `aria-label` y las letras en `aria-hidden`.
 *    Sin eso, un lector de pantalla leería el titular letra a letra: "eme,
 *    a, ce, hache…". Es el fallo clásico de este efecto.
 *
 *  · El reparto se calcula al renderizar, no con reglas `nth-child`. Un
 *    titular tiene entre 15 y 50 letras según el idioma, y escribir a mano
 *    una regla por posición sería inmantenible además de incompleto.
 *
 * Para Google no cambia nada: el texto sigue entero dentro del encabezado,
 * solo que repartido en spans. Y a diferencia de partir por líneas —que es
 * lo que hace la referencia— esto no se descuadra al cambiar de idioma,
 * porque no depende de dónde caiga cada renglón.
 */
export function TextoLetras({
  texto,
  className,
  /** Punto del recorrido donde empieza a entrar la primera letra. */
  desde = 10,
  /** Cuánto recorrido separa la primera letra de la última. */
  reparto = 34,
  /** Cuánto dura la entrada de cada letra. Corto a propósito: si se alarga,
      varias letras están a medio aparecer a la vez y se pierde la sensación
      de que se están escribiendo una tras otra. */
  duracion = 3,
}: {
  texto: string;
  className?: string;
  desde?: number;
  reparto?: number;
  duracion?: number;
}) {
  const palabras = texto.split(" ");
  const total = Math.max(texto.replace(/\s/g, "").length, 1);
  let n = 0;

  return (
    <span aria-label={texto} className={cn("letras", className)}>
      {palabras.map((palabra, p) => (
        <span key={`${palabra}-${p}`} className="palabra">
          {[...palabra].map((letra, i) => {
            const inicio = desde + (n++ / total) * reparto;
            return (
              <span
                key={i}
                aria-hidden
                className="letra"
                style={{ animationRange: `entry ${inicio}% cover ${inicio + duracion}%` }}
              >
                {letra}
              </span>
            );
          })}
          {p < palabras.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
