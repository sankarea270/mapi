import type { LocalizedText } from "@/types/tour";

export interface Destination {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  categorySlugs?: string[];
  tourSlugs?: string[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const DESTINATIONS: Destination[] = [
  {
    slug: "cusco",
    name: t("Cusco", "Cusco", "Cusco"),
    description: t(
      "Capital histórica del Imperio Inca: calles empedradas, templos coloniales y la puerta de entrada a la aventura.",
      "Historic capital of the Inca Empire: cobbled streets, colonial temples and the gateway to adventure.",
      "Capital histórica do Império Inca: ruas de pedra, templos coloniais e porta de entrada para a aventura."
    ),
    image: img("mapi-dest-cusco"),
    categorySlugs: ["cusco"],
  },
  {
    slug: "machu-picchu",
    name: t("Machu Picchu", "Machu Picchu", "Machu Picchu"),
    description: t(
      "La ciudadela inca más famosa del mundo, entre montañas sagradas y niebla de ceja de selva.",
      "The most famous Inca citadel in the world, among sacred mountains and cloud forest mist.",
      "A cidadela inca mais famosa do mundo, entre montanhas sagradas e névoa de floresta nublada."
    ),
    image: img("mapi-dest-machu"),
    categorySlugs: ["machu-picchu"],
  },
  {
    slug: "valle-sagrado",
    name: t("Valle Sagrado", "Sacred Valley", "Vale Sagrado"),
    description: t(
      "Pueblos andinos, mercados de Pisac, terrazas de Moray y las salineras de Maras entre Cusco y Machu Picchu.",
      "Andean towns, Pisac markets, Moray terraces and the Maras salt mines between Cusco and Machu Picchu.",
      "Vilas andinas, mercados de Pisac, terraços de Moray e as salinas de Maras entre Cusco e Machu Picchu."
    ),
    image: img("mapi-dest-valle"),
    categorySlugs: ["valle-sagrado"],
  },
  {
    slug: "arequipa",
    name: t("Arequipa", "Arequipa", "Arequipa"),
    description: t(
      "La ciudad blanca de sillar, el Cañón del Colca y los cóndores en vuelo sobre los Andes del sur.",
      "The white city of sillar, Colca Canyon and condors soaring over the southern Andes.",
      "A cidade branca de sillar, o Cânion do Colca e os condores em voo sobre os Andes do sul."
    ),
    image: img("mapi-dest-arequipa"),
    categorySlugs: ["arequipa"],
  },
  {
    slug: "colca",
    name: t("Cañón del Colca", "Colca Canyon", "Cânion do Colca"),
    description: t(
      "Uno de los cañones más profundos del mundo y el punto de avistamiento de cóndores más famoso del Perú.",
      "One of the deepest canyons in the world and Peru's most famous condor spotting point.",
      "Um dos cânions mais profundos do mundo e o ponto de observação de condores mais famoso do Peru."
    ),
    image: img("mapi-dest-colca"),
    tourSlugs: ["colca-canyon", "colca-3d", "cruz-del-condor"],
  },
  {
    slug: "puno",
    name: t("Puno y el Titicaca", "Puno & Lake Titicaca", "Puno e o Titicaca"),
    description: t(
      "El lago navegable más alto del mundo, islas flotantes de Uros y la cultura aimara viva.",
      "The world's highest navigable lake, the floating Uros islands and living Aymara culture.",
      "O lago navegável mais alto do mundo, as ilhas flutuantes de Uros e a cultura aimará viva."
    ),
    image: img("mapi-dest-puno"),
    categorySlugs: ["puno"],
  },
  {
    slug: "nazca",
    name: t("Líneas de Nazca", "Nazca Lines", "Linhas de Nazca"),
    description: t(
      "Enigmáticos geoglifos que solo pueden apreciarse desde el aire, junto al oasis de Huacachina.",
      "Enigmatic geoglyphs best seen from the air, next to the Huacachina oasis.",
      "Enigmáticos geoglifos visíveis apenas do ar, junto ao oásis de Huacachina."
    ),
    image: img("mapi-dest-nazca"),
    tourSlugs: ["nazca-lines", "paracas-huacachina"],
  },
  {
    slug: "lima",
    name: t("Lima", "Lima", "Lima"),
    description: t(
      "Capital gastronómica de América: océano, barrios bohemios y la mejor cocina del continente.",
      "Gastronomic capital of the Americas: ocean, bohemian districts and the continent's best cuisine.",
      "Capital gastronômica das Américas: oceano, bairros boêmios e a melhor culinária do continente."
    ),
    image: img("mapi-dest-lima"),
    categorySlugs: ["lima"],
  },
  {
    slug: "amazonia",
    name: t("Amazonía", "Amazon", "Amazônia"),
    description: t(
      "Selva virgen, loros en collpas de arcilla, delfines rosados y lodges en plena naturaleza.",
      "Virgin rainforest, macaws at clay licks, pink dolphins and lodges deep in nature.",
      "Floresta virgem, araras em collpas de argila, golfinhos cor-de-rosa e lodges em plena natureza."
    ),
    image: img("mapi-dest-amazon"),
    categorySlugs: ["amazonia"],
  },
  {
    slug: "iquitos",
    name: t("Iquitos", "Iquitos", "Iquitos"),
    description: t(
      "La ciudad más grande del mundo sin acceso por carretera, puerta a la Amazonía profunda.",
      "The world's largest city unreachable by road, gateway to the deep Amazon.",
      "A maior cidade do mundo sem acesso por estrada, porta de entrada para a Amazônia profunda."
    ),
    image: img("mapi-dest-iquitos"),
    tourSlugs: ["iquitos-amazon", "pacaya-samiria", "quistococha"],
  },
  {
    slug: "puerto-maldonado",
    name: t("Puerto Maldonado", "Puerto Maldonado", "Puerto Maldonado"),
    description: t(
      "Reserva Nacional de Tambopata: guacamayos, ríos amazónicos y una biodiversidad incomparable.",
      "Tambopata National Reserve: macaws, Amazonian rivers and incomparable biodiversity.",
      "Reserva Nacional de Tambopata: araras, rios amazônicos e biodiversidade incomparável."
    ),
    image: img("mapi-dest-puerto"),
    tourSlugs: ["tambopata", "tambopata-4d"],
  },
  {
    slug: "manu",
    name: t("Manu", "Manu", "Manu"),
    description: t(
      "Parque Nacional del Manu, Reserva de Biósfera: la mayor biodiversidad del planeta en un solo lugar.",
      "Manu National Park, Biosphere Reserve: the greatest biodiversity on the planet in a single place.",
      "Parque Nacional do Manu, Reserva da Biosfera: a maior biodiversidade do planeta em um só lugar."
    ),
    image: img("mapi-dest-manu"),
    tourSlugs: ["manu-jungle", "manu-express", "manu-guacamayos"],
  },
  {
    slug: "norte",
    name: t("Norte del Perú", "Northern Peru", "Norte do Peru"),
    description: t(
      "Tumbas reales, fortalezas de barro, la catarata Gocta y los Andes del Huascarán.",
      "Royal tombs, mud-brick fortresses, Gocta Falls and the Huascarán Andes.",
      "Tumbas reais, fortalezas de barro, a cachoeira Gocta e os Andes de Huascarán."
    ),
    image: img("mapi-dest-norte"),
    categorySlugs: ["norte"],
  },
];