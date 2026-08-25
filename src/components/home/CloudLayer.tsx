/**
 * Neblina del hero.
 *
 * No son nubes de cielo: son bancos de niebla apoyados en la base del
 * encuadre, como la que se queda en el fondo de un valle andino. Se dibujan
 * en SVG y se deforman con feTurbulence + feDisplacementMap, que es lo que
 * da el borde deshilachado; una elipse difuminada se lee como mancha, y el
 * ruido fractal no. El filtro se rasteriza una vez y la animación es solo
 * `transform`, así que el coste por frame es componer una capa.
 *
 * Reglas de la composición:
 *  - Densidad creciente hacia abajo: los bancos de la base son opacos y
 *    anchos; según suben, se adelgazan y pierden opacidad hasta desaparecer.
 *  - Cada banco se disuelve hacia arriba con una máscara vertical, para que
 *    no tenga un borde superior definido: eso es lo que separa "niebla" de
 *    "nube recortada".
 *  - Los de abajo oscilan en el sitio (siempre cubren la base) y los altos
 *    cruzan de lado a lado: la niebla repta, no desfila.
 *  - Una sola dirección de luz, desde arriba, coherente en todos.
 *
 * La capa se monta DENTRO del hero y por debajo del texto (z-20), porque a
 * esta altura del encuadre coincide con el titular y lo taparía al pasar.
 */

type Puff = readonly [cx: number, cy: number, rx: number, ry: number];

/**
 * Siluetas sobre un viewBox de 2000x240, con la masa concentrada abajo para
 * que la máscara pueda disolver la parte alta.
 *
 * La caja es larga y baja a propósito, y el SVG se dibuja con su proporción
 * natural. Antes se forzaba `preserveAspectRatio="none"` con una altura fija
 * en CSS: eso estiraba la caja al ancho del banco (1000x300 metidos en
 * 1330x149), aplastaba los borregos en churretes horizontales y deformaba el
 * ruido, con lo que el banco se leía como una banda lisa en vez de niebla.
 * Los radios se mantienen cercanos a circulares por el mismo motivo.
 */
const SHAPES: readonly (readonly Puff[])[] = [
  // 0 · Banco ancho y denso, con base corrida
  [
    [120, 170, 150, 105],
    [300, 155, 165, 118],
    [480, 168, 155, 108],
    [660, 150, 175, 125],
    [850, 165, 160, 112],
    [1040, 152, 170, 120],
    [1230, 168, 158, 110],
    [1420, 156, 168, 118],
    [1610, 170, 150, 104],
    [1800, 160, 160, 112],
    [1950, 172, 140, 98],
    [1000, 206, 1010, 64],
  ],
  // 1 · Banco irregular, con levantamientos
  [
    [160, 155, 150, 120],
    [350, 180, 130, 88],
    [560, 140, 180, 142],
    [780, 172, 140, 96],
    [1000, 150, 165, 126],
    [1220, 182, 128, 86],
    [1450, 142, 175, 138],
    [1680, 170, 145, 100],
    [1900, 160, 150, 110],
    [1000, 210, 1010, 58],
  ],
  // 2 · Velo fino
  [
    [200, 188, 170, 54],
    [480, 180, 160, 50],
    [780, 190, 150, 46],
    [1100, 182, 165, 52],
    [1420, 188, 155, 48],
    [1750, 184, 160, 50],
    [1980, 190, 130, 42],
  ],
  // 3 · Masa alta y volumétrica
  [
    [180, 148, 160, 128],
    [400, 168, 145, 102],
    [640, 128, 195, 155],
    [900, 158, 165, 124],
    [1160, 142, 180, 140],
    [1420, 166, 150, 104],
    [1680, 140, 180, 140],
    [1920, 160, 155, 116],
    [1000, 204, 1010, 68],
  ],
  // 4 · Jirones sueltos, para las capas altas
  [
    [250, 180, 175, 52],
    [620, 172, 160, 46],
    [1000, 184, 168, 50],
    [1380, 176, 150, 44],
    [1750, 186, 145, 42],
  ],
];

interface MistSpec {
  shape: number;
  /** 0 = velo alto y tenue · 1 = banco medio · 2 = base densa. */
  depth: 0 | 1 | 2;
  seed: number;
  /** Distancia del borde inferior del banco al pie del hero, en %. */
  band: number;
  /** Ancho en vw. */
  width: number;
  /**
   * "sway" oscila en el sitio: para la base, que debe cubrir siempre de lado
   * a lado. "travel" cruza el encuadre: para los jirones altos.
   */
  mode: "sway" | "travel";
  duration: number;
  offset: number;
  flip?: boolean;
}

/**
 * Ordenados de arriba (tenue) a abajo (denso). Hay más capas abajo a
 * propósito: es lo que acumula la niebla contra el suelo.
 */
const MIST: readonly MistSpec[] = [
  // Jirones altos: cruzan el encuadre, finos y casi disueltos.
  { shape: 4, depth: 0, seed: 27, band: 26, width: 62, mode: "travel", duration: 172, offset: 40 },
  { shape: 2, depth: 0, seed: 11, band: 22, width: 70, mode: "travel", duration: 148, offset: 96, flip: true },
  { shape: 4, depth: 0, seed: 63, band: 18, width: 66, mode: "travel", duration: 190, offset: 150 },

  // Bancos medios.
  { shape: 2, depth: 1, seed: 41, band: 12, width: 98, mode: "sway", duration: 74, offset: 0, flip: true },
  { shape: 1, depth: 1, seed: 19, band: 8, width: 108, mode: "sway", duration: 92, offset: 26 },
  { shape: 0, depth: 1, seed: 52, band: 5, width: 116, mode: "sway", duration: 108, offset: 52, flip: true },

  // Base densa: siempre presente, se sale por abajo y queda recortada.
  { shape: 3, depth: 2, seed: 8, band: 0, width: 132, mode: "sway", duration: 86, offset: 12 },
  { shape: 0, depth: 2, seed: 77, band: -4, width: 146, mode: "sway", duration: 116, offset: 44, flip: true },
  { shape: 3, depth: 2, seed: 95, band: -8, width: 160, mode: "sway", duration: 98, offset: 70 },
];

/**
 * Parámetros por estrato. `fade` marca dónde empieza a verse el banco dentro
 * de su caja: cuanto más alto está, más se disuelve. El tinte va horneado en
 * el gradiente y no como filter CSS, que con nueve capas animadas se
 * reevaluaría por frame.
 */
const DEPTH = {
  0: {
    displace: 62,
    blur: 5,
    freq: "0.013 0.019",
    octaves: 4,
    fade: [0.32, 0.74],
    stops: ["#dbe7ea", "#c4d6db", "#a8c2c9", "#6e8a92"],
  },
  1: {
    displace: 80,
    blur: 3.2,
    freq: "0.009 0.015",
    octaves: 5,
    fade: [0.2, 0.62],
    stops: ["#eaf2f4", "#d2e2e6", "#b2c9d0", "#5f7d86"],
  },
  2: {
    displace: 96,
    blur: 2.2,
    freq: "0.007 0.012",
    octaves: 5,
    fade: [0.1, 0.48],
    stops: ["#f2f7f8", "#dde9ec", "#bcd0d6", "#547079"],
  },
} as const;

function MistBank({ spec, index }: { spec: MistSpec; index: number }) {
  const uid = `mist${index}`;
  const { displace, blur, freq, octaves, fade, stops } = DEPTH[spec.depth];
  const puffs = SHAPES[spec.shape];

  return (
    <div
      className={`mist mist--${spec.mode} mist--d${spec.depth}`}
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
        className="mist__art"
        viewBox="0 0 2000 240"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={`${uid}-f`}
            x="-15%"
            y="-45%"
            width="130%"
            height="190%"
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

          {/*
            Gradientes en objectBoundingBox (por defecto): al referenciarlos
            desde varias elipses, CADA una recibe el gradiente mapeado a su
            propia caja. Eso da a cada borrego su cresta iluminada y su
            hondonada en sombra, que es lo que hace que el banco tenga
            volumen; un único gradiente sobre todo el grupo lo deja plano.
          */}
          <radialGradient id={`${uid}-body`} cx="0.38" cy="0.28" r="0.75">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="45%" stopColor={stops[1]} />
            <stop offset="100%" stopColor={stops[2]} />
          </radialGradient>

          {/* Hondonadas: copia desplazada a contraluz, bajo el cuerpo. */}
          <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.45" r="0.62">
            <stop offset="0%" stopColor={stops[3]} stopOpacity="0.85" />
            <stop offset="70%" stopColor={stops[3]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={stops[3]} stopOpacity="0" />
          </radialGradient>

          {/* Crestas al sol, desplazadas hacia la luz. */}
          <radialGradient id={`${uid}-lit`} cx="0.36" cy="0.26" r="0.55">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/*
            Disolución vertical: sin esto el banco tendría un borde superior
            recortado y se leería como nube, no como niebla.
          */}
          <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" />
            <stop offset={`${fade[0] * 100}%`} stopColor="#2b2b2b" />
            <stop offset={`${fade[1] * 100}%`} stopColor="#d8d8d8" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <mask id={`${uid}-m`}>
            <rect x="0" y="0" width="2000" height="240" fill={`url(#${uid}-fade)`} />
          </mask>
        </defs>

        <g mask={`url(#${uid}-m)`}>
          <g filter={`url(#${uid}-f)`}>
            {/* Sombra -> cuerpo -> cresta: el orden es el que construye el relieve. */}
            <g fill={`url(#${uid}-shadow)`} transform="translate(16 22)">
              {puffs.map(([cx, cy, rx, ry], i) => (
                <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} />
              ))}
            </g>
            <g fill={`url(#${uid}-body)`}>
              {puffs.map(([cx, cy, rx, ry], i) => (
                <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} />
              ))}
            </g>
            <g fill={`url(#${uid}-lit)`} transform="translate(-12 -18)">
              {puffs.map(([cx, cy, rx, ry], i) => (
                <ellipse key={i} cx={cx} cy={cy} rx={rx * 0.84} ry={ry * 0.8} />
              ))}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function CloudLayer() {
  return (
    <div className="cloud-layer" aria-hidden="true">
      {/* Halo difuso pegado al suelo: asienta los bancos sobre el paisaje. */}
      <div className="haze haze--low" />
      {MIST.map((spec, i) => (
        <MistBank key={i} spec={spec} index={i} />
      ))}
      <div className="haze haze--drift" />
    </div>
  );
}
