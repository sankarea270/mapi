import type { LocalizedText } from "@/types/tour";

/**
 * Normales climáticas aproximadas por región del Perú, más nivel de lluvia y
 * de afluencia turística mes a mes.
 *
 * Son promedios típicos de cada zona, no un pronóstico: la interfaz los
 * presenta siempre como aproximados. Se guardan aquí, junto al resto de datos
 * del sitio, en lugar de llamar a una API del tiempo, porque lo que ayuda a
 * decidir un viaje es la pauta estacional —cuándo llueve, cuándo hace frío de
 * noche, cuándo se llena— y no la temperatura de mañana.
 *
 * rain  0 = seco · 1 = alguna lluvia · 2 = lluvias frecuentes · 3 = temporada de lluvias
 * crowd 0 = tranquilo · 1 = moderado · 2 = concurrido · 3 = temporada alta
 */
export interface MonthClimate {
  /** Máxima media diurna, °C. */
  tMax: number;
  /** Mínima media nocturna, °C. */
  tMin: number;
  rain: 0 | 1 | 2 | 3;
  crowd: 0 | 1 | 2 | 3;
}

export interface RegionClimate {
  slug: string;
  /** Altitud de referencia en metros; se omite en la costa y la selva baja. */
  altitude?: number;
  months: MonthClimate[];
  /** Meses recomendados (índice 0-11). */
  best: number[];
  /** Por qué esos meses, en el idioma del visitante. */
  why: LocalizedText;
}

const ANDES_CUSCO: MonthClimate[] = [
  { tMax: 19, tMin: 7, rain: 3, crowd: 1 },
  { tMax: 19, tMin: 7, rain: 3, crowd: 0 },
  { tMax: 20, tMin: 7, rain: 2, crowd: 1 },
  { tMax: 21, tMin: 5, rain: 1, crowd: 2 },
  { tMax: 21, tMin: 2, rain: 0, crowd: 2 },
  { tMax: 20, tMin: 0, rain: 0, crowd: 3 },
  { tMax: 20, tMin: -1, rain: 0, crowd: 3 },
  { tMax: 21, tMin: 1, rain: 0, crowd: 3 },
  { tMax: 21, tMin: 3, rain: 1, crowd: 2 },
  { tMax: 22, tMin: 5, rain: 1, crowd: 2 },
  { tMax: 21, tMin: 6, rain: 2, crowd: 2 },
  { tMax: 20, tMin: 7, rain: 3, crowd: 2 },
];

const ANDES_MACHU: MonthClimate[] = [
  { tMax: 26, tMin: 12, rain: 3, crowd: 1 },
  { tMax: 26, tMin: 12, rain: 3, crowd: 0 },
  { tMax: 26, tMin: 12, rain: 2, crowd: 1 },
  { tMax: 26, tMin: 11, rain: 1, crowd: 2 },
  { tMax: 26, tMin: 9, rain: 0, crowd: 3 },
  { tMax: 25, tMin: 8, rain: 0, crowd: 3 },
  { tMax: 25, tMin: 8, rain: 0, crowd: 3 },
  { tMax: 26, tMin: 9, rain: 0, crowd: 3 },
  { tMax: 26, tMin: 10, rain: 1, crowd: 2 },
  { tMax: 27, tMin: 11, rain: 1, crowd: 2 },
  { tMax: 27, tMin: 11, rain: 2, crowd: 2 },
  { tMax: 26, tMin: 12, rain: 3, crowd: 2 },
];

const ALTIPLANO: MonthClimate[] = [
  { tMax: 15, tMin: 4, rain: 3, crowd: 1 },
  { tMax: 15, tMin: 4, rain: 3, crowd: 0 },
  { tMax: 15, tMin: 3, rain: 2, crowd: 1 },
  { tMax: 16, tMin: 1, rain: 1, crowd: 1 },
  { tMax: 16, tMin: -3, rain: 0, crowd: 2 },
  { tMax: 15, tMin: -6, rain: 0, crowd: 2 },
  { tMax: 15, tMin: -7, rain: 0, crowd: 3 },
  { tMax: 16, tMin: -5, rain: 0, crowd: 3 },
  { tMax: 17, tMin: -2, rain: 1, crowd: 2 },
  { tMax: 18, tMin: 1, rain: 1, crowd: 2 },
  { tMax: 18, tMin: 2, rain: 2, crowd: 1 },
  { tMax: 16, tMin: 4, rain: 3, crowd: 1 },
];

const AREQUIPA: MonthClimate[] = [
  { tMax: 22, tMin: 10, rain: 1, crowd: 1 },
  { tMax: 22, tMin: 10, rain: 2, crowd: 1 },
  { tMax: 22, tMin: 9, rain: 1, crowd: 1 },
  { tMax: 23, tMin: 8, rain: 0, crowd: 2 },
  { tMax: 22, tMin: 6, rain: 0, crowd: 2 },
  { tMax: 22, tMin: 5, rain: 0, crowd: 3 },
  { tMax: 21, tMin: 5, rain: 0, crowd: 3 },
  { tMax: 22, tMin: 6, rain: 0, crowd: 3 },
  { tMax: 23, tMin: 7, rain: 0, crowd: 2 },
  { tMax: 23, tMin: 8, rain: 0, crowd: 2 },
  { tMax: 23, tMin: 9, rain: 0, crowd: 2 },
  { tMax: 23, tMin: 10, rain: 1, crowd: 2 },
];

const AMAZONIA: MonthClimate[] = [
  { tMax: 31, tMin: 22, rain: 3, crowd: 1 },
  { tMax: 31, tMin: 22, rain: 3, crowd: 1 },
  { tMax: 31, tMin: 22, rain: 3, crowd: 1 },
  { tMax: 31, tMin: 22, rain: 3, crowd: 1 },
  { tMax: 31, tMin: 21, rain: 2, crowd: 2 },
  { tMax: 31, tMin: 21, rain: 1, crowd: 2 },
  { tMax: 31, tMin: 20, rain: 1, crowd: 3 },
  { tMax: 32, tMin: 21, rain: 1, crowd: 3 },
  { tMax: 32, tMin: 21, rain: 2, crowd: 2 },
  { tMax: 32, tMin: 22, rain: 2, crowd: 2 },
  { tMax: 32, tMin: 22, rain: 3, crowd: 2 },
  { tMax: 31, tMin: 22, rain: 3, crowd: 1 },
];

const COSTA_LIMA: MonthClimate[] = [
  { tMax: 27, tMin: 20, rain: 0, crowd: 2 },
  { tMax: 28, tMin: 21, rain: 0, crowd: 2 },
  { tMax: 28, tMin: 20, rain: 0, crowd: 2 },
  { tMax: 26, tMin: 18, rain: 0, crowd: 2 },
  { tMax: 23, tMin: 17, rain: 0, crowd: 2 },
  { tMax: 20, tMin: 16, rain: 0, crowd: 2 },
  { tMax: 19, tMin: 15, rain: 0, crowd: 3 },
  { tMax: 19, tMin: 15, rain: 0, crowd: 3 },
  { tMax: 20, tMin: 15, rain: 0, crowd: 2 },
  { tMax: 22, tMin: 16, rain: 0, crowd: 2 },
  { tMax: 24, tMin: 17, rain: 0, crowd: 2 },
  { tMax: 26, tMin: 19, rain: 0, crowd: 2 },
];

const NORTE: MonthClimate[] = [
  { tMax: 30, tMin: 20, rain: 2, crowd: 2 },
  { tMax: 31, tMin: 21, rain: 2, crowd: 2 },
  { tMax: 31, tMin: 21, rain: 2, crowd: 2 },
  { tMax: 30, tMin: 20, rain: 1, crowd: 1 },
  { tMax: 28, tMin: 18, rain: 0, crowd: 1 },
  { tMax: 26, tMin: 17, rain: 0, crowd: 2 },
  { tMax: 25, tMin: 16, rain: 0, crowd: 2 },
  { tMax: 25, tMin: 16, rain: 0, crowd: 2 },
  { tMax: 26, tMin: 17, rain: 0, crowd: 2 },
  { tMax: 27, tMin: 17, rain: 0, crowd: 1 },
  { tMax: 28, tMin: 18, rain: 1, crowd: 1 },
  { tMax: 29, tMin: 19, rain: 1, crowd: 2 },
];

export const REGIONS: RegionClimate[] = [
  {
    slug: "cusco",
    altitude: 3400,
    months: ANDES_CUSCO,
    best: [3, 4, 8, 9],
    why: {
      es: "Abril-mayo y septiembre-octubre son el punto dulce: ya casi no llueve, el campo sigue verde y hay bastante menos gente que en pleno invierno andino.",
      en: "April–May and September–October are the sweet spot: the rain has eased, the countryside is still green and there are far fewer people than at the peak of the Andean winter.",
      pt: "Abril-maio e setembro-outubro são o ponto ideal: quase não chove, o campo continua verde e há bem menos gente do que no auge do inverno andino.",
    },
  },
  {
    slug: "valle-sagrado",
    altitude: 2800,
    months: ANDES_CUSCO,
    best: [3, 4, 8, 9],
    why: {
      es: "El Valle está más bajo y templado que Cusco. En abril-mayo y septiembre-octubre se juntan días despejados, noches menos frías y andenes todavía verdes.",
      en: "The valley sits lower and milder than Cusco. April–May and September–October combine clear days, less freezing nights and terraces that are still green.",
      pt: "O vale é mais baixo e ameno que Cusco. Em abril-maio e setembro-outubro juntam-se dias claros, noites menos frias e terraços ainda verdes.",
    },
  },
  {
    slug: "machu-picchu",
    altitude: 2430,
    months: ANDES_MACHU,
    best: [3, 4, 8, 9],
    why: {
      es: "Machu Picchu está en ceja de selva: más cálido y húmedo que Cusco. En los meses de hombro hay menos neblina al amanecer y menos cola en la ciudadela.",
      en: "Machu Picchu sits on the cloud-forest edge: warmer and wetter than Cusco. In the shoulder months there is less dawn fog and shorter queues at the citadel.",
      pt: "Machu Picchu fica na borda da floresta nublada: mais quente e úmido que Cusco. Nos meses de ombro há menos neblina ao amanhecer e menos fila na cidadela.",
    },
  },
  {
    slug: "puno",
    altitude: 3800,
    months: ALTIPLANO,
    best: [3, 4, 8, 9],
    why: {
      es: "En el altiplano lo decisivo es la noche: en junio y julio baja de cero con facilidad. Abril y septiembre dan cielos limpios sobre el lago sin ese frío extremo.",
      en: "On the altiplano the night is what counts: June and July drop below freezing easily. April and September give clear skies over the lake without that extreme cold.",
      pt: "No altiplano o decisivo é a noite: em junho e julho cai abaixo de zero com facilidade. Abril e setembro dão céus limpos sobre o lago sem esse frio extremo.",
    },
  },
  {
    slug: "arequipa",
    altitude: 2335,
    months: AREQUIPA,
    best: [3, 4, 8, 9, 10],
    why: {
      es: "Arequipa presume de sol casi todo el año. Se evita solo el corto período de lluvias de enero-marzo, que puede complicar la carretera al Colca.",
      en: "Arequipa enjoys sun almost year-round. Only the short January–March rains are worth avoiding, as they can complicate the road to the Colca.",
      pt: "Arequipa tem sol quase o ano todo. Evita-se apenas o curto período de chuvas de janeiro-março, que pode complicar a estrada ao Colca.",
    },
  },
  {
    slug: "amazonia",
    months: AMAZONIA,
    best: [4, 5, 6, 7, 8],
    why: {
      es: "En la selva no hay frío, hay agua. De mayo a septiembre baja el río: más senderos abiertos, más fauna concentrada en las orillas y menos mosquitos.",
      en: "In the rainforest it is not about cold but water. From May to September the river drops: more trails open, wildlife concentrated on the banks and fewer mosquitoes.",
      pt: "Na selva não há frio, há água. De maio a setembro o rio baixa: mais trilhas abertas, fauna concentrada nas margens e menos mosquitos.",
    },
  },
  {
    slug: "lima",
    months: COSTA_LIMA,
    best: [0, 1, 2, 10, 11],
    why: {
      es: "Lima vive dos ciudades distintas: verano soleado de diciembre a marzo, y de junio a septiembre una bruma baja constante que apaga la costa.",
      en: "Lima is two different cities: a sunny summer from December to March, and from June to September a constant low haze that dulls the coast.",
      pt: "Lima vive duas cidades distintas: verão ensolarado de dezembro a março, e de junho a setembro uma bruma baixa constante que apaga a costa.",
    },
  },
  {
    slug: "norte",
    months: NORTE,
    best: [4, 5, 8, 9],
    why: {
      es: "El norte es cálido casi siempre. Conviene esquivar enero-marzo, cuando las lluvias afectan sobre todo a la ruta de Chachapoyas y Kuélap.",
      en: "The north is warm almost all year. It is worth dodging January–March, when the rains mainly affect the Chachapoyas and Kuélap route.",
      pt: "O norte é quente quase sempre. Convém evitar janeiro-março, quando as chuvas afetam sobretudo a rota de Chachapoyas e Kuélap.",
    },
  },
];

/** Regiones a las que se asimilan las categorías que no tienen clima propio. */
const CATEGORY_FALLBACK: Record<string, string> = {
  aventura: "cusco",
};

export function climateForCategory(categorySlug: string): RegionClimate {
  const slug = CATEGORY_FALLBACK[categorySlug] ?? categorySlug;
  return REGIONS.find((r) => r.slug === slug) ?? REGIONS[0];
}
