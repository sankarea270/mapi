export interface LocalizedText {
  es: string;
  en: string;
  pt: string;
}

export interface TourItineraryDay {
  day: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface Tour {
  slug: string;
  name: LocalizedText;
  duration: LocalizedText;
  price: number;
  image: string;
  categorySlug: string;
  rating: number;
  featured?: boolean;
  /** Resumen de dos o tres líneas: el de la tarjeta del listado. */
  excerpt?: LocalizedText;
  /** Descripción larga de la ficha, en párrafos separados por una línea en
      blanco. Sin ella la ficha enseña el resumen. */
  description?: LocalizedText;
  gallery?: string[];
  included?: LocalizedText[];
  notIncluded?: LocalizedText[];
  itinerary?: TourItineraryDay[];
  /** Mapa propio de la ubicación (una imagen: la ruta, el punto de
      encuentro) y su texto. Sin ellos la ficha usa los del destino. */
  locationImage?: string;
  location?: LocalizedText;
}

export interface TourCategory {
  slug: string;
  name: LocalizedText;
  /** Fondo de la cabecera de «Tours» al elegir esta categoría. */
  image?: string;
  tours: Tour[];
}