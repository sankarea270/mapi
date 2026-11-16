/*
 * Texto de un día del itinerario.
 *
 * Los itinerarios del panel vienen escritos por bloques separados por una
 * línea en blanco, y cada bloque suele empezar con una línea de hora y título
 * («08:00 a. m. – Desayuno en Mollepata») seguida de la explicación. La ficha
 * lo pintaba en un único párrafo y todo se leía seguido: «4:30 a.m. – Departure
 * from Cusco Transfer to the train station… 8:00 a.m. – Arrival…».
 *
 * Aquí cada bloque es un paso: la primera línea, en negrita y con la hora
 * destacada; el resto, como texto. Los bloques de una sola línea con la forma
 * «Etiqueta: texto» resaltan la etiqueta. Si el día es un párrafo corrido sin
 * estructura, sale igual que antes.
 */

const HORA = /^(\d{1,2}(?::\d{2})?\s*(?:[ap]\.?\s?m\.?|h\d{0,2})?)\s*[–—-]\s*(.+)$/i;

function Titulo({ linea }: { linea: string }) {
  const m = linea.match(HORA);
  if (!m) return <>{linea}</>;
  return (
    <>
      <span className="mr-1.5 font-heading tabular-nums tracking-wide text-teal-700">{m[1].trim()}</span>
      {m[2]}
    </>
  );
}

interface Paso {
  titulo?: string;
  texto: string;
}

/* Cada línea de hora abre un paso, aunque los bloques no estén separados por
   una línea en blanco; si no hay horas, la primera línea de un bloque de
   varias hace de título. */
function aPasos(texto: string): Paso[] {
  const pasos: Paso[] = [];
  for (const bloque of texto.split(/\n\s*\n/)) {
    const lineas = bloque.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lineas.length === 0) continue;
    if (lineas.some((l) => HORA.test(l))) {
      let actual: Paso | null = null;
      for (const l of lineas) {
        if (HORA.test(l)) {
          actual = { titulo: l, texto: "" };
          pasos.push(actual);
        } else if (actual) {
          actual.texto = `${actual.texto} ${l}`.trim();
        } else {
          pasos.push({ texto: l });
        }
      }
    } else if (lineas.length > 1) {
      pasos.push({ titulo: lineas[0], texto: lineas.slice(1).join(" ") });
    } else {
      pasos.push({ texto: lineas[0] });
    }
  }
  return pasos;
}

export function TextoItinerario({ texto }: { texto: string }) {
  const pasos = aPasos(texto);

  if (pasos.length <= 1 && !pasos[0]?.titulo) {
    return <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">{texto}</p>;
  }

  return (
    <div className="mt-3 max-w-2xl space-y-3.5">
      {pasos.map((paso, i) => {
        if (paso.titulo) {
          return (
            <div key={i}>
              <p className="text-[15px] font-semibold leading-snug text-slate-900">
                <Titulo linea={paso.titulo} />
              </p>
              {paso.texto && <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{paso.texto}</p>}
            </div>
          );
        }
        const etiqueta = paso.texto.match(/^([^:]{2,40}):\s+(.+)$/);
        return (
          <p key={i} className="text-[15px] leading-relaxed text-slate-600">
            {etiqueta ? (
              <>
                <span className="font-semibold text-slate-900">{etiqueta[1]}:</span> {etiqueta[2]}
              </>
            ) : (
              paso.texto
            )}
          </p>
        );
      })}
    </div>
  );
}
