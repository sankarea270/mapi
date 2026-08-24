import type { LocalizedText } from "@/types/tour";

export interface GuideSection {
  heading: LocalizedText;
  body: LocalizedText;
}

export interface Guide {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  image: string;
  category: "como-llegar" | "clima" | "equipaje" | "seguridad" | "visas" | "faq";
  sections: GuideSection[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

export const GUIDES: Guide[] = [
  {
    slug: "como-llegar",
    title: t("Cómo llegar al Perú", "How to get to Peru", "Como chegar ao Peru"),
    excerpt: t(
      "Vuelos, aeropuertos y consejos para tu llegada a Lima y conexiones internas.",
      "Flights, airports and tips for arriving in Lima and domestic connections.",
      "Voos, aeroportos e dicas para chegar a Lima e conexões internas."
    ),
    image: img("mapi-guia-llegar"),
    category: "como-llegar",
    sections: [
      {
        heading: t("Aeropuerto Jorge Chávez (Lima)", "Jorge Chavez Airport (Lima)", "Aeroporto Jorge Chávez (Lima)"),
        body: t(
          "El Aeropuerto Internacional Jorge Chávez es la principal puerta de entrada al Perú. Los vuelos internacionales llegan desde América, Europa y Asia con conexiones diarias hacia Cusco, Arequipa y otras ciudades.",
          "Jorge Chavez International Airport is Peru's main gateway. International flights arrive from the Americas, Europe and Asia with daily connections to Cusco, Arequipa and other cities.",
          "O Aeroporto Internacional Jorge Chávez é a principal porta de entrada do Peru. Voos internacionais chegam das Américas, Europa e Ásia com conexões diárias para Cusco, Arequipa e outras cidades."
        ),
      },
      {
        heading: t("Conexiones internas", "Domestic connections", "Conexões internas"),
        body: t(
          "Los vuelos de Lima a Cusco duran aproximadamente 1 hora. También hay vuelos a Arequipa, Juliaca (Puno), Iquitos y Puerto Maldonado. Nuestro equipo coordina tus traslados internos.",
          "Flights from Lima to Cusco take about 1 hour. There are also flights to Arequipa, Juliaca (Puno), Iquitos and Puerto Maldonado. Our team coordinates your domestic transfers.",
          "Os voos de Lima para Cusco duram cerca de 1 hora. Também há voos para Arequipa, Juliaca (Puno), Iquitos e Puerto Maldonado. Nossa equipe coordena seus traslados internos."
        ),
      },
      {
        heading: t("Documentación y aduana", "Documents and customs", "Documentação e alfândega"),
        body: t(
          "Necesitas pasaporte vigente por al menos 6 meses. La mayoría de nacionalidades entran sin visa por hasta 183 días (revisa los requisitos de tu país). Declara cualquier objeto de valor.",
          "You need a passport valid for at least 6 months. Most nationalities enter visa-free for up to 183 days (check your country's requirements). Declare any valuables.",
          "Você precisa de passaporte válido por pelo menos 6 meses. A maioria das nacionalidades entra sem visto por até 183 dias (verifique os requisitos do seu país). Declare objetos de valor."
        ),
      },
    ],
  },
  {
    slug: "mejor-epoca",
    title: t("Mejor época para viajar", "Best time to travel", "Melhor época para viajar"),
    excerpt: t(
      "Estaciones, clima y los mejores meses para cada región del Perú.",
      "Seasons, weather and the best months for each region of Peru.",
      "Estações, clima e os melhores meses para cada região do Peru."
    ),
    image: img("mapi-guia-epoca"),
    category: "clima",
    sections: [
      {
        heading: t("Temporada seca (mayo – octubre)", "Dry season (May – October)", "Temporada seca (maio – outubro)"),
        body: t(
          "Es la mejor época para trekking: Camino Inca, Salkantay y Montaña de 7 Colores con cielos despejados. Cusco y Machu Picchu tienen días soleados y noches frías.",
          "This is the best season for trekking: Inca Trail, Salkantay and Rainbow Mountain with clear skies. Cusco and Machu Picchu have sunny days and cold nights.",
          "É a melhor época para trekking: Trilha Inca, Salkantay e Montanha das 7 Cores com céu limpo. Cusco e Machu Picchu têm dias ensolarados e noites frias."
        ),
      },
      {
        heading: t("Temporada de lluvias (noviembre – abril)", "Rainy season (November – April)", "Temporada de chuvas (novembro – abril)"),
        body: t(
          "Paisajes verdes y menos turistas. La Amazonía está en su mejor momento. Enero y febrero son ideales para selva y costa norte.",
          "Green landscapes and fewer tourists. The Amazon is at its best. January and February are ideal for the jungle and the northern coast.",
          "Paisagens verdes e menos turistas. A Amazônia está no seu melhor. Janeiro e fevereiro são ideais para a selva e o litoral norte."
        ),
      },
      {
        heading: t("Fiestas y eventos", "Festivals and events", "Festas e eventos"),
        body: t(
          "El Inti Raymi (24 de junio) y el Corpus Christi atraen multitudes en Cusco. Reserva con anticipación si planeas viajar en esas fechas.",
          "Inti Raymi (June 24) and Corpus Christi draw crowds in Cusco. Book ahead if you plan to travel on those dates.",
          "O Inti Raymi (24 de junho) e o Corpus Christi atraem multidões em Cusco. Reserve com antecedência se planeja viajar nessas datas."
        ),
      },
    ],
  },
  {
    slug: "que-llevar",
    title: t("Qué llevar al viaje", "What to pack", "O que levar na viagem"),
    excerpt: t(
      "Lista práctica de equipaje según región, altura y temporada.",
      "A practical packing list by region, altitude and season.",
      "Lista prática de bagagem por região, altitude e estação."
    ),
    image: img("mapi-guia-llevar"),
    category: "equipaje",
    sections: [
      {
        heading: t("Ropa por capas", "Layered clothing", "Roupas em camadas"),
        body: t(
          "En los Andes el clima cambia en minutos: lleva ropa térmica, polar, cortavientos y una chaqueta impermeable. En la selva, ropa ligera de manga larga y repelente.",
          "In the Andes the weather changes within minutes: bring thermal wear, fleece, windbreaker and a waterproof jacket. In the jungle, light long-sleeve clothing and repellent.",
          "Nos Andes o clima muda em minutos: leve roupa térmica, fleece, corta-vento e jaqueta impermeável. Na selva, roupas leves de manga longa e repelente."
        ),
      },
      {
        heading: t("Altura y sol", "Altitude and sun", "Altitude e sol"),
        body: t(
          "Protector solar de alta protección, gorra o sombrero y lentes de sol son imprescindibles: la radiación en altura es intensa.",
          "High-protection sunscreen, cap or hat and sunglasses are essential: radiation at altitude is intense.",
          "Protetor solar de alta proteção, boné ou chapéu e óculos de sol são essenciais: a radiação em altitude é intensa."
        ),
      },
      {
        heading: t("Extras útiles", "Useful extras", "Extras úteis"),
        body: t(
          "Botella de agua reutilizable, snack energético, cargador portátil, copias de tus documentos y un día extra de ropa de repuesto.",
          "Reusable water bottle, energy snacks, power bank, copies of your documents and one extra change of clothes.",
          "Garrafa de água reutilizável, lanche energético, power bank, cópias dos seus documentos e uma troca de roupa extra."
        ),
      },
    ],
  },
  {
    slug: "seguridad",
    title: t("Seguridad en el viaje", "Travel safety", "Segurança na viagem"),
    excerpt: t(
      "Recomendaciones de seguridad generales para disfrutar el Perú con tranquilidad.",
      "General safety recommendations to enjoy Peru with peace of mind.",
      "Recomendações gerais de segurança para aproveitar o Peru com tranquilidade."
    ),
    image: img("mapi-guia-seguridad"),
    category: "seguridad",
    sections: [
      {
        heading: t("En la ciudad", "In the city", "Na cidade"),
        body: t(
          "Guarda tus pertenencias a la vista y usa taxis de empresas reconocidas o aplicaciones de transporte. En lugares concurridos, mantén tu mochila al frente.",
          "Keep your belongings in sight and use taxis from recognized companies or ride-hailing apps. In crowded places, keep your backpack in front.",
          "Mantenha seus pertences à vista e use táxis de empresas reconhecidas ou aplicativos de transporte. Em locais movimentados, mantenha a mochila à frente."
        ),
      },
      {
        heading: t("En la naturaleza", "In nature", "Na natureza"),
        body: t(
          "Sigue siempre a tu guía en senderos y miradores. No te alejes de la ruta y respeta las indicaciones de los parques nacionales.",
          "Always follow your guide on trails and viewpoints. Do not leave the route and respect national park instructions.",
          "Siga sempre o seu guia em trilhas e mirantes. Não saia da rota e respeite as orientações dos parques nacionais."
        ),
      },
      {
        heading: t("Emergencias", "Emergencies", "Emergências"),
        body: t(
          "Guarda los contactos de emergencia: bomberos 116, policía 105 y el número de tu operador turístico disponible 24/7.",
          "Keep emergency contacts: firefighters 116, police 105 and your tour operator's 24/7 number.",
          "Guarde os contatos de emergência: bombeiros 116, polícia 105 e o número do seu operador turístico disponível 24/7."
        ),
      },
    ],
  },
  {
    slug: "visas",
    title: t("Visas y requisitos", "Visas & requirements", "Vistos e requisitos"),
    excerpt: t(
      "Requisitos de ingreso, vacunas y recomendaciones para tu entrada al Perú.",
      "Entry requirements, vaccines and recommendations for entering Peru.",
      "Requisitos de entrada, vacinas e recomendações para entrar no Peru."
    ),
    image: img("mapi-guia-visas"),
    category: "visas",
    sections: [
      {
        heading: t("Exención de visa", "Visa exemption", "Isenção de visto"),
        body: t(
          "Ciudadanos de la UE, EE. UU., Canadá, México, Brasil, Chile, Argentina y la mayoría de países ingresan sin visa hasta 183 días. Verifica en la página de Migraciones del Perú.",
          "Citizens of the EU, US, Canada, Mexico, Brazil, Chile, Argentina and most countries enter visa-free for up to 183 days. Check Peru's Migration page.",
          "Cidadãos da UE, EUA, Canadá, México, Brasil, Chile, Argentina e da maioria dos países entram sem visto por até 183 dias. Verifique na página de Migrações do Peru."
        ),
      },
      {
        heading: t("Vacunas recomendadas", "Recommended vaccines", "Vacinas recomendadas"),
        body: t(
          "La fiebre amarilla se recomienda para viajar a la Amazonía (aplica al menos 10 días antes). Verifica las recomendaciones de tu país.",
          "Yellow fever is recommended for the Amazon (apply at least 10 days before). Check your country's recommendations.",
          "A febre amarela é recomendada para viajar à Amazônia (aplicar pelo menos 10 dias antes). Verifique as recomendações do seu país."
        ),
      },
      {
        heading: t("Seguro de viaje", "Travel insurance", "Seguro de viagem"),
        body: t(
          "Recomendamos un seguro con cobertura médica, cancelación y actividades de aventura. Es requisito para trekkings como el Camino Inca.",
          "We recommend insurance with medical coverage, cancellation and adventure activities. It is required for treks like the Inca Trail.",
          "Recomendamos um seguro com cobertura médica, cancelamento e atividades de aventura. É requisito para trekkings como a Trilha Inca."
        ),
      },
    ],
  },
  {
    slug: "faq",
    title: t("Preguntas frecuentes", "Frequently asked questions", "Perguntas frequentes"),
    excerpt: t(
      "Las dudas más comunes antes de viajar con nosotros, respondidas por nuestro equipo.",
      "The most common questions before traveling with us, answered by our team.",
      "As dúvidas mais comuns antes de viajar conosco, respondidas pela nossa equipe."
    ),
    image: img("mapi-guia-faq"),
    category: "faq",
    sections: [
      {
        heading: t("¿Necesito aclimatarme en Cusco?", "Do I need to acclimatize in Cusco?", "Preciso me aclimatar em Cusco?"),
        body: t(
          "Sí, recomendamos llegar 2 días antes de hacer trekking o visitar lugares de altura. Toma mate de coca, evita comidas pesadas y bebe mucha agua.",
          "Yes, we recommend arriving 2 days before trekking or visiting high-altitude places. Drink coca tea, avoid heavy meals and hydrate well.",
          "Sim, recomendamos chegar 2 dias antes de fazer trekking ou visitar locais de altitude. Tome chá de coca, evite comidas pesadas e beba muita água."
        ),
      },
      {
        heading: t("¿Cómo hago la reserva?", "How do I book?", "Como faço a reserva?"),
        body: t(
          "Completa el formulario en la página del tour o escríbenos por WhatsApp. Confirmamos disponibilidad y cupos en menos de 24 horas, sin pagos en línea por ahora.",
          "Fill out the form on the tour page or message us on WhatsApp. We confirm availability within 24 hours, no online payments for now.",
          "Preencha o formulário na página do tour ou escreva-nos pelo WhatsApp. Confirmamos disponibilidade em até 24 horas, sem pagamentos on-line por enquanto."
        ),
      },
      {
        heading: t("¿Qué pasa si llueve?", "What if it rains?", "E se chover?"),
        body: t(
          "La mayoría de tours se realizan con lluvia ligera. En caso de suspensión por seguridad, reprogramamos tu experiencia sin costo adicional.",
          "Most tours run in light rain. If a tour is suspended for safety, we reschedule your experience at no extra cost.",
          "A maioria dos tours acontece com chuva leve. Em caso de suspensão por segurança, remarcamos sua experiência sem custo adicional."
        ),
      },
      {
        heading: t("¿Incluyen entradas?", "Are entrance fees included?", "Os ingressos estão incluídos?"),
        body: t(
          "Cada tour indica si las entradas están incluidas. Para Machu Picchu gestionamos tus boletos con anticipación según disponibilidad.",
          "Each tour states whether entrance fees are included. For Machu Picchu we arrange your tickets in advance based on availability.",
          "Cada tour informa se os ingressos estão incluídos. Para Machu Picchu, providenciamos seus bilhetes com antecedência conforme disponibilidade."
        ),
      },
    ],
  },
];