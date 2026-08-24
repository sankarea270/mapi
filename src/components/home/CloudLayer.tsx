/**
 * Capa de nubes del hero.
 *
 * Las nubes se dibujan como SVG y se deforman con feTurbulence +
 * feDisplacementMap: eso rompe la silueta elíptica y produce el borde
 * irregular y algodonoso de un cúmulo real. El filtro se rasteriza una sola
 * vez; la animación es únicamente `transform`, así que el coste por frame es
 * el de componer una capa (barato incluso en móvil).
 *
 * Coherencia visual con la foto de fondo:
 *  - Una sola dirección de luz (sol arriba-izquierda) en todas las nubes:
 *    corona blanca arriba-izquierda, vientre azulado abajo-derecha.
 *  - Un solo sentido de viento (izquierda -> derecha) para todas.
 *  - Tres estratos de profundidad: las lejanas son pequeñas, lentas, más
 *    tenues y más azules (bruma atmosférica); las cercanas, grandes, rápidas
 *    y contrastadas. Ese gradiente es lo que da sensación de cielo real.
 */

type Puff = readonly [cx: number, cy: number, rx: number, ry: number];

/** Siluetas dibujadas a mano sobre un viewBox de 1000x420. */
const SHAPES: readonly (readonly Puff[])[] = [
  // 0 · Cúmulo ancho de base plana
  [
    [250, 268, 195, 118],
    [430, 218, 220, 150],
    [625, 258, 180, 120],
    [372, 168, 142, 112],
    [772, 282, 132, 96],
    [148, 292, 122, 82],
    [500, 320, 330, 62],
  ],
  // 1 · Cúmulo alto con torre a la izquierda
  [
    [300, 200, 165, 145],
    [455, 258, 195, 128],
    [615, 292, 150, 100],
    [205, 288, 135, 92],
    [372, 132, 108, 88],
    [420, 330, 280, 54],
  ],
  // 2 · Jirón alargado y bajo
  [
    [260, 250, 175, 82],
    [450, 232, 205, 95],
    [640, 252, 165, 78],
    [800, 268, 118, 58],
    [140, 268, 118, 60],
  ],
  // 3 · Grupo compacto y esponjoso
  [
    [390, 232, 172, 132],
    [545, 262, 158, 112],
    [268, 278, 132, 95],
    [462, 152, 112, 92],
    [660, 292, 108, 74],
    [430, 322, 245, 52],
  ],
  // 4 · Banco disperso, tipo cirro bajo
  [
    [320, 244, 190, 70],
    [520, 228, 168, 62],
    [690, 246, 140, 55],
    [180, 258, 128, 50],
  ],
];

interface CloudSpec {
  /** Silueta de SHAPES. */
  shape: number;
  /** Estrato: 0 = lejano, 1 = medio, 2 = cercano. */
  depth: 0 | 1 | 2;
  /** Semilla del ruido: cambia el recorte del borde. */
  seed: number;
  /**
   * Distancia del borde INFERIOR de la nube al pie del hero, en %. Anclar por
   * abajo y no por arriba es deliberado: la nube crece hacia arriba, así que
   * agrandarla nunca la mete en la zona del titular. El techo del hero la
   * recorta, que es justo como entra un cúmulo grande en un encuadre real.
   */
  band: number;
  /** Ancho relativo al viewport. */
  width: number;
  /** Duración de la travesía completa, en segundos. */
  duration: number;
  /** Desfase negativo para que el cielo ya esté poblado al cargar. */
  offset: number;
  /** Espejado horizontal, para no repetir siluetas idénticas. */
  flip?: boolean;
}

/**
 * Todas las nubes viven en el tercio superior. La capa se pinta por encima
 * del titular (z-index 15 contra z-10), así que la franja del texto y los
 * botones —del 31% al 83% del hero— tiene que quedar despejada; el pie lo
 * cubre la bruma, que sí es lo bastante tenue para pasar por detrás.
 *
 * Dentro del cielo, lo cercano va más abajo, más grande y más rápido, y lo
 * lejano más arriba, más pequeño y más lento: es lo que hace la perspectiva
 * real al mirar un cielo, y es lo que da la sensación de profundidad.
 *
 * Los `offset` están calculados para que en el primer frame las nubes queden
 * repartidas a lo ancho y no agrupadas.
 */
const CLOUDS: readonly CloudSpec[] = [
  { shape: 2, depth: 0, seed: 11, band: 86, width: 24, duration: 186, offset: 58 },
  { shape: 4, depth: 0, seed: 27, band: 81, width: 20, duration: 168, offset: 95 },
  { shape: 0, depth: 0, seed: 5, band: 83, width: 26, duration: 174, offset: 136, flip: true },
  { shape: 1, depth: 1, seed: 41, band: 78, width: 34, duration: 118, offset: 22 },
  { shape: 3, depth: 1, seed: 63, band: 75, width: 30, duration: 126, offset: 61, flip: true },
  { shape: 0, depth: 1, seed: 19, band: 76, width: 36, duration: 112, offset: 79 },
  { shape: 3, depth: 2, seed: 77, band: 71, width: 48, duration: 78, offset: 20, flip: true },
  { shape: 1, depth: 2, seed: 8, band: 72, width: 52, duration: 68, offset: 44 },
];

/**
 * Parámetros por estrato. La bruma atmosférica se hornea en el gradiente en
 * vez de aplicarse como filtro CSS: un `filter` sobre un elemento animado se
 * reevalúa por frame, y aquí hay nueve. Así la animación queda en transform +
 * opacity, que la GPU compone sin repintar.
 *
 * Lejano  -> menos contraste, más azul, más difuminado.
 * Cercano -> blanco brillante arriba, vientre marcado abajo.
 */
const DEPTH = {
  0: {
    displace: 46,
    blur: 5,
    freq: "0.0075 0.013",
    octaves: 3,
    stops: ["#f2f6fb", "#e8eff7", "#d5e0ed", "#c2d0e2"],
    lit: 0.5,
  },
  1: {
    displace: 62,
    blur: 3.5,
    freq: "0.0062 0.011",
    octaves: 4,
    stops: ["#fdfeff", "#f4f8fc", "#dfe8f3", "#bccbe0"],
    lit: 0.75,
  },
  2: {
    displace: 78,
    blur: 2.5,
    freq: "0.0052 0.009",
    octaves: 4,
    stops: ["#ffffff", "#f7fafd", "#d8e3f0", "#adbfd6"],
    lit: 0.95,
  },
} as const;

function Cloud({ spec, index }: { spec: CloudSpec; index: number }) {
  const uid = `cl${index}`;
  const { displace, blur, freq, octaves, stops, lit } = DEPTH[spec.depth];
  const puffs = SHAPES[spec.shape];

  return (
    <div
      className={`cloud cloud--d${spec.depth}`}
      style={
        {
          "--band": `${spec.band}%`,
          "--w": `${spec.width}vw`,
          "--dur": `${spec.duration}s`,
          "--delay": `-${spec.offset}s`,
          "--flip": spec.flip ? "-1" : "1",
        } as React.CSSProperties
      }
    >
      <svg
        className="cloud__art"
        viewBox="0 0 1000 420"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={`${uid}-f`}
            x="-20%"
            y="-35%"
            width="140%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={freq}
              numOctaves={octaves}
              seed={spec.seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displace}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rough"
            />
            <feGaussianBlur in="rough" stdDeviation={blur} />
          </filter>

          {/* Sol arriba-izquierda: corona blanca -> vientre azul de cielo. */}
          <linearGradient id={`${uid}-body`} x1="0.3" y1="0.02" x2="0.62" y2="1">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="38%" stopColor={stops[1]} />
            <stop offset="68%" stopColor={stops[2]} />
            <stop offset="100%" stopColor={stops[3]} />
          </linearGradient>

          {/* Realce especular del borde iluminado. */}
          <radialGradient id={`${uid}-lit`} cx="0.34" cy="0.24" r="0.62">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={lit} />
            <stop offset="55%" stopColor="#ffffff" stopOpacity={lit * 0.37} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g filter={`url(#${uid}-f)`}>
          <g fill={`url(#${uid}-body)`}>
            {puffs.map(([cx, cy, rx, ry], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} />
            ))}
          </g>
          {/* Segunda pasada, desplazada hacia el sol, para el volumen. */}
          <g fill={`url(#${uid}-lit)`} transform="translate(-26 -34)">
            {puffs.slice(0, 4).map(([cx, cy, rx, ry], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx * 0.82} ry={ry * 0.78} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

export function CloudLayer() {
  return (
    <div className="cloud-layer" aria-hidden="true">
      {CLOUDS.map((spec, i) => (
        <Cloud key={i} spec={spec} index={i} />
      ))}

      {/* Bruma de horizonte: funde la base del cielo con el paisaje. */}
      <div className="haze haze--low" />
      <div className="haze haze--drift" />
    </div>
  );
}
