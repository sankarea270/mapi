export type Review = {
  id: string;
  name: string;
  country: string;
  rating: number;
  text: { es: string; en: string; pt: string };
  tourSlug?: string;
};

/*
 * `tourSlug` apunta a la ficha del catálogo —tour o paquete— de la que habla
 * la reseña. Cinco de las seis señalaban a slugs que no existen, así que el
 * dato estaba ahí sin que nada lo usara. Quien lo pinta comprueba antes que
 * resuelva: si no, la opinión sale sin enlace en vez de con uno roto.
 */
export const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "María Fernanda",
    country: "México",
    rating: 5,
    text: {
      es: "La experiencia en Machu Picchu fue inolvidable. Guías expertos, puntualidad total y se preocuparon por cada detalle. ¡100% recomendados!",
      en: "The Machu Picchu experience was unforgettable. Expert guides, total punctuality and they took care of every detail. 100% recommended!",
      pt: "A experiência em Machu Picchu foi inesquecível. Guias experientes, pontualidade total e cuidado com cada detalhe. 100% recomendados!",
    },
    tourSlug: "machu-picchu-clasico",
  },
  {
    id: "r2",
    name: "Carlos & Ana",
    country: "España",
    rating: 5,
    text: {
      es: "Hicimos el circuito del Sur del Perú y todo fue perfecto: hoteles, traslados y la organización impecable. Volveremos con ellos.",
      en: "We took the Southern Peru circuit and everything was perfect: hotels, transfers and flawless organization. We will come back with them.",
      pt: "Fizemos o circuito do Sul do Peru e tudo foi perfeito: hotéis, traslados e organização impecável. Voltaremos com eles.",
    },
    tourSlug: "sur-del-peru",
  },
  {
    id: "r3",
    name: "Sarah Johnson",
    country: "United Kingdom",
    rating: 5,
    text: {
      es: "El tour al Valle Sagrado con la experiencia gastronómica superó mis expectativas. Atención personalizada de principio a fin.",
      en: "The Sacred Valley tour with the gastronomy experience exceeded my expectations. Personal attention from start to finish.",
      pt: "O tour pelo Vale Sagrado com a experiência gastronômica superou minhas expectativas. Atenção personalizada do início ao fim.",
    },
    /* Sin resolver a propósito: el texto habla del «Valle Sagrado con la
       experiencia gastronómica» y en el catálogo eso encaja con más de un
       tour. Elegir uno a ojo sería atribuirle a alguien un viaje que no se
       sabe si hizo, así que la ficha sale sin enlace hasta que se decida
       desde el panel. */
    tourSlug: "valle-sagrado-gastronomico",
  },
  {
    id: "r4",
    name: "Juliana R.",
    country: "Brasil",
    rating: 4.5,
    text: {
      es: "Atención en portugués impecable. El tour por la selva de Iquitos fue una aventura increíble con guías locales muy conocedores.",
      en: "Impeccable Portuguese-speaking support. The Iquitos jungle tour was an amazing adventure with very knowledgeable local guides.",
      pt: "Atendimento em português impecável. O tour pela selva de Iquitos foi uma aventura incrível com guias locais muito experientes.",
    },
    tourSlug: "iquitos-amazon",
  },
  {
    id: "r5",
    name: "Thomas Müller",
    country: "Alemania",
    rating: 5,
    text: {
      es: "Reserva en línea fácil, respuesta inmediata por WhatsApp y una experiencia de lujo en el Cañón del Colca. Excelente servicio.",
      en: "Easy online booking, immediate WhatsApp response and a luxury experience at Colca Canyon. Excellent service.",
      pt: "Reserva on-line fácil, resposta imediata pelo WhatsApp e uma experiência de luxo no Cânion do Colca. Excelente serviço.",
    },
    tourSlug: "colca-canyon",
  },
  {
    id: "r6",
    name: "Lucía Gómez",
    country: "Argentina",
    rating: 5,
    text: {
      es: "El equipo respondió todas mis dudas antes del viaje y el itinerario de Cusco fue perfecto. Se nota que aman su trabajo.",
      en: "The team answered all my questions before the trip and the Cusco itinerary was perfect. You can tell they love their job.",
      pt: "A equipe respondeu todas as minhas dúvidas antes da viagem e o roteiro de Cusco foi perfeito. Dá para ver que amam o que fazem.",
    },
    tourSlug: "city-tour-cusco",
  },
];