export type SocialPost = {
  id: string;
  image: string;
  likes: number;
  caption: { es: string; en: string; pt: string };
};

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: "p1",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=600&fit=crop&q=80",
    likes: 1240,
    caption: {
      es: "Machu Picchu, maravilla del mundo 🏔️",
      en: "Machu Picchu, wonder of the world 🏔️",
      pt: "Machu Picchu, maravilha do mundo 🏔️",
    },
  },
  {
    id: "p2",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=600&fit=crop&q=80",
    likes: 890,
    caption: {
      es: "Valle Sagrado de los Incas 🌾",
      en: "Sacred Valley of the Incas 🌾",
      pt: "Vale Sagrado dos Incas 🌾",
    },
  },
  {
    id: "p3",
    image: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=600&h=600&fit=crop&q=80",
    likes: 1520,
    caption: {
      es: "Montaña de 7 colores - Vinicunca 🌈",
      en: "Rainbow Mountain - Vinicunca 🌈",
      pt: "Montanha de 7 cores - Vinicunca 🌈",
    },
  },
  {
    id: "p4",
    image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=600&h=600&fit=crop&q=80",
    likes: 2030,
    caption: {
      es: "Laguna Humantay - Joya turquesa de los Andes 💎",
      en: "Humantay Lake - Turquoise jewel of the Andes 💎",
      pt: "Lagoa Humantay - Joia turquesa dos Andes 💎",
    },
  },
  {
    id: "p5",
    image: "https://images.unsplash.com/photo-1621887178805-37e802d9ed4c?w=600&h=600&fit=crop&q=80",
    likes: 1670,
    caption: {
      es: "Sacsayhuamán - Fortaleza inca en Cusco 🏛️",
      en: "Sacsayhuamán - Inca fortress in Cusco 🏛️",
      pt: "Sacsayhuamán - Fortaleza inca em Cusco 🏛️",
    },
  },
  {
    id: "p6",
    image: "https://images.unsplash.com/photo-1587893904451-13c3f2c9e89e?w=600&h=600&fit=crop&q=80",
    likes: 1105,
    caption: {
      es: "Plaza de Armas de Cusco - Corazón del imperio inca ⛪",
      en: "Cusco Main Square - Heart of the Inca Empire ⛪",
      pt: "Plaza de Armas de Cusco - Coração do império inca ⛪",
    },
  },
];