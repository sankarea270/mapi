import type { LocalizedText, Tour, TourCategory, TourItineraryDay } from "@/types/tour";

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

type TourSeed = [
  slug: string,
  es: string,
  en: string,
  pt: string,
  durEs: string,
  durEn: string,
  durPt: string,
  price: number,
  category: string,
  rating: number,
  featured?: boolean
];

const seeds: TourSeed[] = [
  // Machu Picchu (10)
  ["machu-picchu-clasico", "Machu Picchu Clásico", "Classic Machu Picchu", "Machu Picchu Clássico", "1 día", "1 day", "1 dia", 220, "machu-picchu", 4.9],
  ["machu-picchu-huayna-picchu", "Machu Picchu + Huayna Picchu", "Machu Picchu + Huayna Picchu", "Machu Picchu + Huayna Picchu", "1 día", "1 day", "1 dia", 260, "machu-picchu", 4.8],
  ["machu-picchu-montana", "Machu Picchu + Montaña", "Machu Picchu + Mountain", "Machu Picchu + Montanha", "1 día", "1 day", "1 dia", 265, "machu-picchu", 4.7],
  ["camino-inca-clasico", "Camino Inca Clásico 4D/3N", "Classic Inca Trail 4D/3N", "Trilha Inca Clássica 4D/3N", "4 días / 3 noches", "4 days / 3 nights", "4 dias / 3 noites", 680, "machu-picchu", 5.0, true],
  ["camino-inca-corto", "Camino Inca Corto 2D/1N", "Short Inca Trail 2D/1N", "Trilha Inca Curta 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 420, "machu-picchu", 4.8],
  ["machu-picchu-amanecer", "Machu Picchu Amanecer", "Machu Picchu Sunrise", "Machu Picchu Amanhecer", "1 día", "1 day", "1 dia", 250, "machu-picchu", 4.9],
  ["machu-picchu-vistadome", "Machu Picchu Tren Vistadome", "Machu Picchu Vistadome Train", "Machu Picchu Trem Vistadome", "1 día", "1 day", "1 dia", 290, "machu-picchu", 4.7],
  ["machu-picchu-valle-sagrado", "Machu Picchu + Valle Sagrado 2D/1N", "Machu Picchu + Sacred Valley 2D/1N", "Machu Picchu + Vale Sagrado 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 340, "machu-picchu", 4.9],
  ["machu-picchu-maras-moray", "Machu Picchu + Maras y Moray 2D/1N", "Machu Picchu + Maras & Moray 2D/1N", "Machu Picchu + Maras e Moray 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 330, "machu-picchu", 4.8],
  ["machu-picchu-privado", "Machu Picchu Tour Privado", "Machu Picchu Private Tour", "Machu Picchu Tour Privado", "1 día", "1 day", "1 dia", 420, "machu-picchu", 5.0],
  // Cusco (8)
  ["city-tour-cusco", "City Tour Cusco + 4 Ruinas", "Cusco City Tour + 4 Ruins", "City Tour Cusco + 4 Ruínas", "Medio día", "Half day", "Meio dia", 45, "cusco", 4.8],
  ["cusco-sacsayhuaman", "Cusco + Sacsayhuamán", "Cusco + Sacsayhuaman", "Cusco + Sacsayhuamán", "Medio día", "Half day", "Meio dia", 55, "cusco", 4.7],
  ["valle-sur-cusco", "Valle Sur: Tipón, Pikillacta y Andahuaylillas", "Southern Valley: Tipón, Pikillacta & Andahuaylillas", "Vale Sul: Tipón, Pikillacta e Andahuaylillas", "1 día", "1 day", "1 dia", 50, "cusco", 4.6],
  ["qorikancha-museo", "Qorikancha + Museo Inka", "Qorikancha + Inca Museum", "Qorikancha + Museu Inca", "Medio día", "Half day", "Meio dia", 40, "cusco", 4.6],
  ["cusco-nocturno", "Cusco Nocturno", "Cusco by Night", "Cusco Noturno", "Medio día", "Half day", "Meio dia", 35, "cusco", 4.5],
  ["cusco-gastronomico", "Cusco Gastronómico + Mercado San Pedro", "Cusco Food Tour + San Pedro Market", "Cusco Gastronômico + Mercado San Pedro", "1 día", "1 day", "1 dia", 60, "cusco", 4.9],
  ["cusco-museos", "Museos de Cusco", "Cusco Museums", "Museus de Cusco", "Medio día", "Half day", "Meio dia", 30, "cusco", 4.4],
  ["cusco-fotografico", "Cusco Tour Fotográfico", "Cusco Photo Tour", "Cusco Tour Fotográfico", "Medio día", "Half day", "Meio dia", 70, "cusco", 4.7],
  // Valle Sagrado (7)
  ["valle-sagrado-full-day", "Valle Sagrado Full Day", "Sacred Valley Full Day", "Vale Sagrado Full Day", "1 día", "1 day", "1 dia", 65, "valle-sagrado", 4.9],
  ["valle-sagrado-maras-moray", "Valle Sagrado + Maras y Moray 2D/1N", "Sacred Valley + Maras & Moray 2D/1N", "Vale Sagrado + Maras e Moray 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 180, "valle-sagrado", 4.7],
  ["valle-sagrado-ollantaytambo", "Ollantaytambo + Chinchero", "Ollantaytambo + Chinchero", "Ollantaytambo + Chinchero", "1 día", "1 day", "1 dia", 70, "valle-sagrado", 4.8],
  ["valle-sagrado-pisac", "Pisac + Ollantaytambo Full Day", "Pisac + Ollantaytambo Full Day", "Pisac + Ollantaytambo Full Day", "1 día", "1 day", "1 dia", 68, "valle-sagrado", 4.8],
  ["salineras-maras-moray", "Salineras + Maras + Moray", "Salt Mines + Maras + Moray", "Salineras + Maras + Moray", "1 día", "1 day", "1 dia", 58, "valle-sagrado", 4.7],
  ["valle-sagrado-2dias", "Valle Sagrado 2D/1N", "Sacred Valley 2D/1N", "Vale Sagrado 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 150, "valle-sagrado", 4.6],
  ["valle-sagrado-fotografico", "Valle Sagrado Fotográfico", "Sacred Valley Photo Tour", "Vale Sagrado Fotográfico", "1 día", "1 day", "1 dia", 85, "valle-sagrado", 4.8],
  // Aventura (11)
  ["rainbow-mountain", "Montaña de 7 Colores", "Rainbow Mountain", "Montanha das 7 Cores", "1 día", "1 day", "1 dia", 55, "aventura", 4.8],
  ["laguna-humantay", "Laguna Humantay", "Humantay Lagoon", "Lagoa Humantay", "1 día", "1 day", "1 dia", 60, "aventura", 4.9],
  ["palccoyo", "Palccoyo Montaña de Colores", "Palccoyo Rainbow Mountain", "Palccoyo Montanha das Cores", "1 día", "1 day", "1 dia", 50, "aventura", 4.6],
  ["salkantay-trek", "Salkantay Trek 4D/3N", "Salkantay Trek 4D/3N", "Salkantay Trek 4D/3N", "4 días / 3 noches", "4 days / 3 nights", "4 dias / 3 noites", 550, "aventura", 4.9],
  ["choquequirao-trek", "Choquequirao Trek 4D/3N", "Choquequirao Trek 4D/3N", "Choquequirao Trek 4D/3N", "4 días / 3 noches", "4 days / 3 nights", "4 dias / 3 noites", 480, "aventura", 4.8],
  ["ausangate-trek", "Ausangate Trek 5D/4N", "Ausangate Trek 5D/4N", "Ausangate Trek 5D/4N", "5 días / 4 noches", "5 days / 4 nights", "5 dias / 4 noites", 620, "aventura", 4.9],
  ["rafting-urubamba", "Rafting Río Urubamba", "Urubamba River Rafting", "Rafting Rio Urubamba", "Medio día", "Half day", "Meio dia", 75, "aventura", 4.7],
  ["tirolesa-qeswachaka", "Tirolesa + Puente Q'eswachaka", "Zipline + Q'eswachaka Bridge", "Tirolesa + Ponte Q'eswachaka", "1 día", "1 day", "1 dia", 90, "aventura", 4.6],
  ["cuatrimotos-valle", "Cuatrimotos Valle Sagrado", "ATV Sacred Valley", "Quadriciclos Vale Sagrado", "Medio día", "Half day", "Meio dia", 85, "aventura", 4.7],
  ["bicicleta-malaga", "Bicicleta Malaga–Santa María", "Mountain Bike Malaga–Santa María", "Bicicleta Malaga–Santa María", "1 día", "1 day", "1 dia", 95, "aventura", 4.5],
  ["vinicunca-humantay", "Vinicunca + Humantay 2D/1N", "Vinicunca + Humantay 2D/1N", "Vinicunca + Humantay 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 140, "aventura", 4.8],
  // Amazonía (8)
  ["manu-jungle", "Manu Selva 4D/3N", "Manu Jungle 4D/3N", "Manu Selva 4D/3N", "4 días / 3 noches", "4 days / 3 nights", "4 dias / 3 noites", 480, "amazonia", 4.9],
  ["manu-express", "Manu Selva 3D/2N", "Manu Jungle 3D/2N", "Manu Selva 3D/2N", "3 días / 2 noches", "3 days / 2 nights", "3 dias / 2 noites", 390, "amazonia", 4.8],
  ["manu-guacamayos", "Manu + Collpa de Guacamayos 5D/4N", "Manu + Macaw Clay Lick 5D/4N", "Manu + Collpa de Araras 5D/4N", "5 días / 4 noches", "5 days / 4 nights", "5 dias / 4 noites", 580, "amazonia", 4.9],
  ["tambopata", "Tambopata 3D/2N", "Tambopata 3D/2N", "Tambopata 3D/2N", "3 días / 2 noches", "3 days / 2 nights", "3 dias / 2 noites", 390, "amazonia", 4.7],
  ["tambopata-4d", "Tambopata 4D/3N", "Tambopata 4D/3N", "Tambopata 4D/3N", "4 días / 3 noches", "4 days / 3 nights", "4 dias / 3 noites", 480, "amazonia", 4.8],
  ["iquitos-amazon", "Iquitos Amazon Lodge 4D/3N", "Iquitos Amazon Lodge 4D/3N", "Iquitos Amazon Lodge 4D/3N", "4 días / 3 noches", "4 days / 3 nights", "4 dias / 3 noites", 520, "amazonia", 4.8],
  ["pacaya-samiria", "Pacaya Samiria 5D/4N", "Pacaya Samiria 5D/4N", "Pacaya Samiria 5D/4N", "5 días / 4 noches", "5 days / 4 nights", "5 dias / 4 noites", 650, "amazonia", 4.9],
  ["quistococha", "Quistococha + San Juan 1D", "Quistococha + San Juan 1D", "Quistococha + San Juan 1D", "1 día", "1 day", "1 dia", 45, "amazonia", 4.5],
  // Arequipa (7)
  ["colca-canyon", "Cañón del Colca 2D/1N", "Colca Canyon 2D/1N", "Cânion do Colca 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 150, "arequipa", 4.8],
  ["colca-3d", "Colca + Cabanaconde 3D/2N", "Colca + Cabanaconde 3D/2N", "Colca + Cabanaconde 3D/2N", "3 días / 2 noches", "3 days / 2 nights", "3 dias / 2 noites", 240, "arequipa", 4.7],
  ["city-tour-arequipa", "City Tour Arequipa", "Arequipa City Tour", "City Tour Arequipa", "Medio día", "Half day", "Meio dia", 45, "arequipa", 4.7],
  ["ruta-sillar", "Ruta del Sillar 1D", "Sillar Route 1D", "Rota do Sillar 1D", "1 día", "1 day", "1 dia", 60, "arequipa", 4.6],
  ["cruz-del-condor", "Cruz del Cóndor 1D", "Condor's Cross 1D", "Cruz do Cóndor 1D", "1 día", "1 day", "1 dia", 90, "arequipa", 4.8],
  ["santa-catalina", "Monasterio Santa Catalina", "Santa Catalina Monastery", "Monastério Santa Catalina", "Medio día", "Half day", "Meio dia", 40, "arequipa", 4.7],
  ["misti-climb", "Ascenso Misti 2D/1N", "Misti Climb 2D/1N", "Ascensão Misti 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 380, "arequipa", 4.8],
  // Puno (7)
  ["lago-titicaca", "Lago Titicaca + Uros 1D", "Lake Titicaca + Uros 1D", "Lago Titicaca + Uros 1D", "1 día", "1 day", "1 dia", 45, "puno", 4.7],
  ["titicaca-2d", "Titicaca Uros + Amantaní 2D/1N", "Titicaca Uros + Amantani 2D/1N", "Titicaca Uros + Amantaní 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 95, "puno", 4.8],
  ["titicaca-taquile", "Uros + Taquile 1D", "Uros + Taquile 1D", "Uros + Taquile 1D", "1 día", "1 day", "1 dia", 60, "puno", 4.8],
  ["amantani", "Amantaní 2D/1N + Fiesta", "Amantani 2D/1N + Celebration", "Amantaní 2D/1N + Festa", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 90, "puno", 4.7],
  ["sillustani", "Sillustani + Puno 1D", "Sillustani + Puno 1D", "Sillustani + Puno 1D", "Medio día", "Half day", "Meio dia", 50, "puno", 4.6],
  ["titicaca-lodge", "Titicaca Lodge 2D/1N", "Titicaca Lodge 2D/1N", "Titicaca Lodge 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 220, "puno", 4.9],
  ["isla-suasi", "Isla Suasi 3D/2N", "Suasi Island 3D/2N", "Ilha Suasi 3D/2N", "3 días / 2 noches", "3 days / 2 nights", "3 dias / 2 noites", 280, "puno", 4.8],
  // Lima (6)
  ["city-tour-lima", "City Tour Lima Colonial", "Colonial Lima City Tour", "City Tour Lima Colonial", "Medio día", "Half day", "Meio dia", 50, "lima", 4.6],
  ["lima-barranco", "Lima + Barranco + Miraflores", "Lima + Barranco + Miraflores", "Lima + Barranco + Miraflores", "1 día", "1 day", "1 dia", 55, "lima", 4.7],
  ["paracas-huacachina", "Paracas + Huacachina 2D/1N", "Paracas + Huacachina 2D/1N", "Paracas + Huacachina 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 130, "lima", 4.8],
  ["nazca-lines", "Líneas de Nazca + Huacachina 2D/1N", "Nazca Lines + Huacachina 2D/1N", "Linhas de Nazca + Huacachina 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 180, "lima", 4.7],
  ["pachacamac", "Pachacamac 1D", "Pachacamac 1D", "Pachacamac 1D", "Medio día", "Half day", "Meio dia", 65, "lima", 4.5],
  ["lima-gastronomico", "Lima Gastronómica + Pisco", "Lima Food Tour + Pisco", "Lima Gastronômica + Pisco", "1 día", "1 day", "1 dia", 85, "lima", 4.9],
  // Norte (6)
  ["trujillo-chanchan", "Trujillo + Chan Chan 2D/1N", "Trujillo + Chan Chan 2D/1N", "Trujillo + Chan Chan 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 140, "norte", 4.6],
  ["chiclayo-tucume", "Chiclayo + Túcume 2D/1N", "Chiclayo + Tucume 2D/1N", "Chiclayo + Túcume 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 150, "norte", 4.6],
  ["kuelap-gocta", "Kuélap + Catarata Gocta 2D/1N", "Kuelap + Gocta Falls 2D/1N", "Kuélap + Cachoeira Gocta 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 170, "norte", 4.8],
  ["huaraz-laguna-69", "Huaraz + Laguna 69 2D/1N", "Huaraz + Lake 69 2D/1N", "Huaraz + Lagoa 69 2D/1N", "2 días / 1 noche", "2 days / 1 night", "2 dias / 1 noite", 130, "norte", 4.7],
  ["huanchaco", "Huanchaco + Caballitos de Totora", "Huanchaco + Reed Horses", "Huanchaco + Cavalinhos de Totora", "Medio día", "Half day", "Meio dia", 40, "norte", 4.5],
  ["chachapoyas-3d", "Chachapoyas + Sarcófagos 3D/2N", "Chachapoyas + Sarcophagi 3D/2N", "Chachapoyas + Sarcófagos 3D/2N", "3 días / 2 noches", "3 days / 2 nights", "3 dias / 2 noites", 210, "norte", 4.7],
];

const categoryMeta: Array<{ slug: string; order: number; name: LocalizedText }> = [
  { slug: "machu-picchu", order: 1, name: t("Machu Picchu", "Machu Picchu", "Machu Picchu") },
  { slug: "cusco", order: 2, name: t("Cusco", "Cusco", "Cusco") },
  { slug: "valle-sagrado", order: 3, name: t("Valle Sagrado", "Sacred Valley", "Vale Sagrado") },
  { slug: "aventura", order: 4, name: t("Aventura", "Adventure", "Aventura") },
  { slug: "amazonia", order: 5, name: t("Amazonía", "Amazon", "Amazônia") },
  { slug: "arequipa", order: 6, name: t("Arequipa", "Arequipa", "Arequipa") },
  { slug: "puno", order: 7, name: t("Puno", "Puno", "Puno") },
  { slug: "lima", order: 8, name: t("Lima", "Lima", "Lima") },
  { slug: "norte", order: 9, name: t("Norte del Perú", "Northern Peru", "Norte do Peru") },
];

const includedByDuration: Record<string, LocalizedText[]> = {
  short: [
    t("Transporte turístico", "Tourist transportation", "Transporte turístico"),
    t("Guía profesional bilingüe", "Professional bilingual guide", "Guia profissional bilíngue"),
    t("Entradas a sitios turísticos", "Entrance fees", "Ingressos"),
  ],
  multiday: [
    t("Transporte turístico", "Tourist transportation", "Transporte turístico"),
    t("Guía profesional bilingüe", "Professional bilingual guide", "Guia profissional bilíngue"),
    t("Entradas a sitios turísticos", "Entrance fees", "Ingressos"),
    t("Alojamiento y comidas", "Lodging and meals", "Hospedagem e refeições"),
    t("Asistencia 24/7 en viaje", "24/7 on-trip assistance", "Assistência 24/7 durante a viagem"),
  ],
};

const dayTitles: Record<"es" | "en" | "pt", string[]> = {
  es: ["Llegada y bienvenida", "Exploración del destino", "Aventura y cultura", "Experiencia inolvidable", "Retorno y despedida"],
  en: ["Arrival & welcome", "Exploring the destination", "Adventure & culture", "Unforgettable experience", "Return & farewell"],
  pt: ["Chegada e boas-vindas", "Exploração do destino", "Aventura e cultura", "Experiência inesquecível", "Retorno e despedida"],
};

const dayDescriptions: Record<"es" | "en" | "pt", string> = {
  es: "Día guiado con expertos locales: traslados, visitas principales y tiempo libre para fotos y cultura.",
  en: "Guided day with local experts: transfers, main sights and free time for photos and culture.",
  pt: "Dia guiado com especialistas locais: traslados, pontos principais e tempo livre para fotos e cultura.",
};

function parseDays(duration: string): number {
  const match = duration.match(/(\d+)\s*(día|dias|day|days|dia|dias)/i);
  if (match) return Math.min(5, Math.max(1, parseInt(match[1], 10)));
  return 1;
}

function buildDetails(tour: Tour): Tour {
  const days = parseDays(tour.duration.es);
  const name = tour.name;

  const excerpt: LocalizedText = {
    es: `Vive la experiencia única de ${name.es} con guías expertos locales. Transporte, entradas y acompañamiento profesional incluidos para que disfrutes de cada momento sin preocupaciones.`,
    en: `Live the unique experience of ${name.en} with expert local guides. Transportation, entrance fees and professional support included, so you can enjoy every moment worry-free.`,
    pt: `Viva a experiência única de ${name.pt} com guias locais especializados. Transporte, ingressos e acompanhamento profissional incluídos para aproveitar cada momento sem preocupações.`,
  };

  const included = includedByDuration[days > 1 ? "multiday" : "short"];

  const itinerary: TourItineraryDay[] = Array.from({ length: days }, (_, i) => ({
    day: `Día ${i + 1}`,
    title: t(dayTitles.es[i], dayTitles.en[i], dayTitles.pt[i]),
    description: t(dayDescriptions.es, dayDescriptions.en, dayDescriptions.pt),
  }));

  return {
    ...tour,
    excerpt,
    included,
    itinerary,
    gallery: [tour.image, img(`${tour.slug}-b`, 900, 700), img(`${tour.slug}-c`, 900, 700)],
  };
}

export function getMockCategories(): TourCategory[] {
  const byCategory = new Map<string, Tour[]>();

  for (const seed of seeds) {
    const [
      slug,
      es,
      en,
      pt,
      durEs,
      durEn,
      durPt,
      price,
      category,
      rating,
      featured,
    ] = seed;

    const tour = buildDetails({
      slug,
      name: t(es, en, pt),
      duration: t(durEs, durEn, durPt),
      price,
      image: img(`mapi-${slug}`, 900, 700),
      categorySlug: category,
      rating,
      featured: featured ?? false,
    });

    const list = byCategory.get(category) ?? [];
    list.push(tour);
    byCategory.set(category, list);
  }

  return categoryMeta
    .map((meta) => ({
      ...meta,
      tours: (byCategory.get(meta.slug) ?? []).sort((a, b) => b.rating - a.rating),
    }))
    .filter((c) => c.tours.length > 0);
}