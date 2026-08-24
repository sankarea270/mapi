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
  excerpt?: LocalizedText;
  gallery?: string[];
  included?: LocalizedText[];
  itinerary?: TourItineraryDay[];
}

export interface TourCategory {
  slug: string;
  name: LocalizedText;
  tours: Tour[];
}