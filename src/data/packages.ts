import type { LocalizedText } from "@/types/tour";

export interface TourPackage {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  price: number;
  duration: LocalizedText;
  tourSlugs: string[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

export const PACKAGES: TourPackage[] = [
  {
    slug: "cusco-express",
    name: t("Cusco Express 5D/4N", "Cusco Express 5D/4N", "Cusco Express 5D/4N"),
    description: t(
      "El circuito esencial del Cusco: ciudad imperial, Valle Sagrado, Machu Picchu y la Montaña de 7 Colores.",
      "The essential Cusco circuit: imperial city, Sacred Valley, Machu Picchu and Rainbow Mountain.",
      "O circuito essencial de Cusco: cidade imperial, Vale Sagrado, Machu Picchu e Montanha das 7 Cores."
    ),
    image: img("mapi-paq-cusco-express"),
    price: 590,
    duration: t("5 días / 4 noches", "5 days / 4 nights", "5 dias / 4 noites"),
    tourSlugs: [
      "city-tour-cusco",
      "valle-sagrado-full-day",
      "machu-picchu-clasico",
      "rainbow-mountain",
      "cusco-gastronomico",
    ],
  },
  {
    slug: "sur-del-peru",
    name: t("Sur del Perú 6D/5N", "Southern Peru 6D/5N", "Sul do Peru 6D/5N"),
    description: t(
      "Cusco, Machu Picchu, el Cañón del Colca y el Lago Titicaca en un solo viaje por los Andes del sur.",
      "Cusco, Machu Picchu, Colca Canyon and Lake Titicaca in a single journey through the southern Andes.",
      "Cusco, Machu Picchu, Cânion do Colca e Lago Titicaca em uma única viagem pelos Andes do sul."
    ),
    image: img("mapi-paq-sur"),
    price: 780,
    duration: t("6 días / 5 noches", "6 days / 5 nights", "6 dias / 5 noites"),
    tourSlugs: [
      "city-tour-cusco",
      "machu-picchu-clasico",
      "valle-sagrado-full-day",
      "colca-3d",
      "lago-titicaca",
    ],
  },
  {
    slug: "peru-clasico",
    name: t("Perú Clásico 9D/8N", "Classic Peru 9D/8N", "Peru Clássico 9D/8N"),
    description: t(
      "El recorrido completo: Lima, Nazca, Colca, Titicaca, Valle Sagrado y Machu Picchu.",
      "The complete route: Lima, Nazca, Colca, Titicaca, Sacred Valley and Machu Picchu.",
      "O roteiro completo: Lima, Nazca, Colca, Titicaca, Vale Sagrado e Machu Picchu."
    ),
    image: img("mapi-paq-peru"),
    price: 1250,
    duration: t("9 días / 8 noches", "9 days / 8 nights", "9 dias / 8 noites"),
    tourSlugs: [
      "lima-barranco",
      "nazca-lines",
      "colca-3d",
      "lago-titicaca",
      "valle-sagrado-full-day",
      "machu-picchu-clasico",
      "city-tour-cusco",
    ],
  },
  {
    slug: "norte-del-peru",
    name: t("Norte del Perú 5D/4N", "Northern Peru 5D/4N", "Norte do Peru 5D/4N"),
    description: t(
      "Kuélap, la catarata Gocta, Chan Chan y las culturas Moche y Chavín en la ruta norte.",
      "Kuelap, Gocta Falls, Chan Chan and the Moche and Chavin cultures on the northern route.",
      "Kuélap, a cachoeira Gocta, Chan Chan e as culturas Moche e Chavín na rota norte."
    ),
    image: img("mapi-paq-norte"),
    price: 640,
    duration: t("5 días / 4 noches", "5 days / 4 nights", "5 dias / 4 noites"),
    tourSlugs: [
      "kuelap-gocta",
      "chachapoyas-3d",
      "chiclayo-tucume",
      "trujillo-chanchan",
      "huanchaco",
    ],
  },
  {
    slug: "luna-de-miel",
    name: t("Luna de Miel 7D/6N", "Honeymoon 7D/6N", "Lua de Mel 7D/6N"),
    description: t(
      "Machu Picchu, un lodge sobre el Titicaca, el oasis de Huacachina y cenas inolvidables en Lima.",
      "Machu Picchu, a lodge on Lake Titicaca, the Huacachina oasis and unforgettable dinners in Lima.",
      "Machu Picchu, um lodge no Titicaca, o oásis de Huacachina e jantares inesquecíveis em Lima."
    ),
    image: img("mapi-paq-miel"),
    price: 980,
    duration: t("7 días / 6 noches", "7 days / 6 nights", "7 dias / 6 noites"),
    tourSlugs: [
      "machu-picchu-valle-sagrado",
      "valle-sagrado-2dias",
      "titicaca-lodge",
      "paracas-huacachina",
      "lima-gastronomico",
    ],
  },
  {
    slug: "familia",
    name: t("Perú en Familia 6D/5N", "Family Peru 6D/5N", "Peru em Família 6D/5N"),
    description: t(
      "Un itinerario pensado para niños y adultos: cultura, naturaleza y experiencias amigables.",
      "An itinerary designed for kids and adults: culture, nature and family-friendly experiences.",
      "Um roteiro pensado para crianças e adultos: cultura, natureza e experiências para toda a família."
    ),
    image: img("mapi-paq-familia"),
    price: 820,
    duration: t("6 días / 5 noches", "6 days / 5 nights", "6 dias / 5 noites"),
    tourSlugs: [
      "machu-picchu-clasico",
      "valle-sagrado-full-day",
      "palccoyo",
      "cusco-gastronomico",
      "quistococha",
    ],
  },
  {
    slug: "grupos",
    name: t("Cusco para Grupos 4D/3N", "Cusco for Groups 4D/3N", "Cusco para Grupos 4D/3N"),
    description: t(
      "El circuito de Cusco al mejor precio por persona para grupos de 10 o más viajeros.",
      "The Cusco circuit at the best per-person price for groups of 10 or more travelers.",
      "O circuito de Cusco com o melhor preço por pessoa para grupos de 10 ou mais viajantes."
    ),
    image: img("mapi-paq-grupos"),
    price: 450,
    duration: t("4 días / 3 noches", "4 days / 3 nights", "4 dias / 3 noites"),
    tourSlugs: ["machu-picchu-clasico", "city-tour-cusco", "valle-sagrado-full-day"],
  },
];