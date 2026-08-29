import type { LocalizedText } from "@/types/tour";

/**
 * Avales y registros oficiales del sector turismo.
 *
 * Solo se recogen el nombre del organismo y qué es: no se incluyen números de
 * registro ni fechas, porque son datos de la empresa que deben salir de sus
 * documentos y no inventarse aquí. Si se quieren mostrar, hay que añadirlos a
 * mano tras comprobarlos.
 */
export interface Credential {
  /** Archivo en /public, ya recortado y convertido a WebP. */
  file: string;
  /** Nombre corto del organismo, tal cual se conoce. */
  name: string;
  /** Nombre completo o naturaleza del aval. */
  label: LocalizedText;
  /** Proporción del recorte, para reservar el hueco y evitar saltos. */
  width: number;
  height: number;
}

export const CREDENTIALS: Credential[] = [
  {
    file: "aval-mincetur.webp",
    name: "MINCETUR",
    width: 470,
    height: 400,
    label: {
      es: "Ministerio de Comercio Exterior y Turismo",
      en: "Ministry of Foreign Trade and Tourism",
      pt: "Ministério do Comércio Exterior e Turismo",
    },
  },
  {
    file: "aval-gercetur.webp",
    name: "GERCETUR",
    width: 600,
    height: 374,
    label: {
      es: "Gerencia Regional de Comercio Exterior, Turismo y Artesanía",
      en: "Regional Board of Foreign Trade, Tourism and Crafts",
      pt: "Gerência Regional de Comércio Exterior, Turismo e Artesanato",
    },
  },
  {
    file: "aval-agencia-registrada.webp",
    name: "Agencia registrada",
    width: 600,
    height: 245,
    label: {
      es: "Agencia de viajes y turismo registrada",
      en: "Registered travel and tourism agency",
      pt: "Agência de viagens e turismo registrada",
    },
  },
  {
    file: "aval-marca-peru.webp",
    name: "Marca Perú",
    width: 509,
    height: 305,
    label: {
      es: "Marca país del Perú",
      en: "Peru country brand",
      pt: "Marca país do Peru",
    },
  },
];
