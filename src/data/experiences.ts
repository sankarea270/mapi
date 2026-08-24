import type { LocalizedText } from "@/types/tour";

export interface Experience {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  tourSlugs: string[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

export const EXPERIENCES: Experience[] = [
  {
    slug: "textileria",
    name: t("Textilería Andina", "Andean Textiles", "Tecelagem Andina"),
    description: t(
      "Conoce los telares de Pisac y Chinchero, donde los colores de los Andes cobran vida.",
      "Discover the looms of Pisac and Chinchero, where the colors of the Andes come to life.",
      "Conheça os teares de Pisac e Chinchero, onde as cores dos Andes ganham vida."
    ),
    image: img("mapi-exp-textil"),
    tourSlugs: ["valle-sagrado-pisac", "cusco-fotografico", "cusco-museos"],
  },
  {
    slug: "festivales",
    name: t("Festivales y Fiestas", "Festivals & Celebrations", "Festivais e Festas"),
    description: t(
      "Inti Raymi, fiestas patronales y celebraciones andinas con comunidades locales.",
      "Inti Raymi, patron saint festivals and Andean celebrations with local communities.",
      "Inti Raymi, festas de padroeiros e celebrações andinas com comunidades locais."
    ),
    image: img("mapi-exp-festival"),
    tourSlugs: ["amantani", "titicaca-2d", "cusco-nocturno"],
  },
  {
    slug: "cocina",
    name: t("Cocina Peruana", "Peruvian Cooking", "Culinária Peruana"),
    description: t(
      "Clases de cocina con chefs locales: ceviche, lomo saltado y los sabores de la tierra.",
      "Cooking classes with local chefs: ceviche, lomo saltado and the flavors of the land.",
      "Aulas de culinária com chefs locais: ceviche, lomo saltado e os sabores da terra."
    ),
    image: img("mapi-exp-cocina"),
    tourSlugs: ["cusco-gastronomico", "lima-gastronomico"],
  },
  {
    slug: "gastronomia",
    name: t("Rutas Gastronómicas", "Food Tours", "Rotas Gastronômicas"),
    description: t(
      "Mercados, picanterías y food tours por las capitales gastronómicas del Perú.",
      "Markets, picanterías and food tours through Peru's gastronomic capitals.",
      "Mercados, picanterías e food tours pelas capitais gastronômicas do Peru."
    ),
    image: img("mapi-exp-gastro"),
    tourSlugs: ["cusco-gastronomico", "lima-gastronomico", "valle-sagrado-pisac"],
  },
  {
    slug: "pisco",
    name: t("Ruta del Pisco", "Pisco Route", "Rota do Pisco"),
    description: t(
      "Degustaciones y bodegas artesanales para conocer la bebida bandera del Perú.",
      "Tastings and artisan distilleries to discover Peru's signature drink.",
      "Degustações e destilarias artesanais para conhecer a bebida símbolo do Peru."
    ),
    image: img("mapi-exp-pisco"),
    tourSlugs: ["lima-gastronomico", "lima-barranco"],
  },
  {
    slug: "fotografia",
    name: t("Fotografía de Viajes", "Travel Photography", "Fotografia de Viagem"),
    description: t(
      "Tours fotográficos guiados por profesionales: luces doradas y paisajes únicos.",
      "Photography tours led by professionals: golden light and unique landscapes.",
      "Tours fotográficos guiados por profissionais: luz dourada e paisagens únicas."
    ),
    image: img("mapi-exp-foto"),
    tourSlugs: ["cusco-fotografico", "valle-sagrado-fotografico", "machu-picchu-amanecer"],
  },
  {
    slug: "astroturismo",
    name: t("Astroturismo", "Astrotourism", "Astroturismo"),
    description: t(
      "Cielos andinos sin contaminación lumínica: observa la Vía Láctea desde los Andes.",
      "Andean skies without light pollution: watch the Milky Way from the Andes.",
      "Céus andinos sem poluição luminosa: observe a Via Láctea a partir dos Andes."
    ),
    image: img("mapi-exp-astro"),
    tourSlugs: ["machu-picchu-amanecer", "valle-sagrado-2dias"],
  },
];