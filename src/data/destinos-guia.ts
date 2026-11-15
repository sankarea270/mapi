import type { LocalizedText } from "@/types/tour";

/*
 * Guía de viaje de cada destino: qué ver, cuándo ir, cómo llegar y preguntas
 * frecuentes, en los tres idiomas.
 *
 * Por qué existe. Search Console (noviembre de 2026) mostraba que las
 * páginas de destino en inglés reciben casi todas las impresiones de la web
 * —«cusco tours», 535 al trimestre— pero salen en la segunda página o más
 * abajo, y nadie hace clic. La página era una foto, una frase y la lista de
 * tours: el título prometía «qué ver, precios y mejor época» y el contenido
 * no lo daba. Esto es lo que lo da.
 *
 * Primero fueron Cusco, Valle Sagrado, Machu Picchu y Arequipa; después, el
 * resto, en el orden de impresiones de Search Console (Lima, Manu, Puno,
 * Colca, Amazonía, Nazca…).
 *
 * Vive en el repositorio, como el cuerpo de las guías, porque son secciones
 * con listas y preguntas que el editor genérico del panel no sabe manejar.
 * La foto, el nombre y la frase del destino siguen saliendo del panel.
 *
 * Los datos que cambian (precios de entradas, horarios de trenes) se dejan
 * fuera a propósito: aquí envejecerían sin que nadie lo notara. Lo que hay
 * —alturas, distancias, temporadas— es estable.
 *
 * `tour` es la dirección de uno de nuestros tours relacionado con el lugar.
 * Si ese tour deja de existir, el enlace simplemente no se pinta.
 */

export interface LugarDestino {
  nombre: LocalizedText;
  texto: LocalizedText;
  tour?: string;
}

export interface PreguntaDestino {
  pregunta: LocalizedText;
  respuesta: LocalizedText;
}

export interface GuiaDestino {
  /** Región del panel del clima, para los destinos sin categoría propia (Colca, Manu, Iquitos…). */
  clima?: string;
  /** Destinos que se combinan con este en un mismo viaje; se enlazan al final de la guía. */
  cerca?: string[];
  intro: LocalizedText[];
  queVer: LugarDestino[];
  cuandoIr: LocalizedText[];
  comoLlegar: LocalizedText[];
  preguntas: PreguntaDestino[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

export const GUIAS_DESTINO: Record<string, GuiaDestino> = {
  cusco: {
    cerca: ["valle-sagrado", "machu-picchu", "manu", "puerto-maldonado"],
    intro: [
      t(
        "Cusco fue la capital del Imperio Inca y hoy es la ciudad desde la que empiezan casi todos los viajes al sur andino del Perú. Sus calles combinan muros incas de piedra perfectamente encajada con iglesias y casonas coloniales levantadas encima, y su centro histórico es Patrimonio de la Humanidad desde 1983.",
        "Cusco was the capital of the Inca Empire and today it is the city where almost every trip to the southern Peruvian Andes begins. Its streets combine Inca walls of perfectly fitted stone with the colonial churches and mansions built on top of them, and its historic centre has been a World Heritage Site since 1983.",
        "Cusco foi a capital do Império Inca e hoje é a cidade de onde partem quase todas as viagens ao sul andino do Peru. Suas ruas combinam muros incas de pedras perfeitamente encaixadas com igrejas e casarões coloniais construídos por cima, e seu centro histórico é Patrimônio da Humanidade desde 1983."
      ),
      t(
        "Está a unos 3400 metros sobre el nivel del mar, así que conviene llegar con calma: un día tranquilo de aclimatación antes de las excursiones de altura hace que el resto del viaje se disfrute mucho más. Desde aquí salen los tours a Machu Picchu, al Valle Sagrado y a la Montaña de Colores.",
        "It sits at around 3,400 metres above sea level, so it pays to arrive slowly: one easy day to acclimatise before the high-altitude excursions makes the rest of the trip far more enjoyable. Tours to Machu Picchu, the Sacred Valley and Rainbow Mountain all leave from here.",
        "Fica a cerca de 3.400 metros acima do nível do mar, então vale a pena chegar com calma: um dia tranquilo de aclimatação antes dos passeios de altitude faz o resto da viagem render muito mais. Daqui saem os tours para Machu Picchu, o Vale Sagrado e a Montanha Colorida."
      ),
    ],
    queVer: [
      {
        nombre: t("Plaza de Armas y Catedral", "Plaza de Armas and the Cathedral", "Plaza de Armas e Catedral"),
        texto: t(
          "El corazón de la ciudad, sobre la antigua plaza inca de Huacaypata. La Catedral guarda una de las mejores colecciones de pintura de la Escuela Cusqueña.",
          "The heart of the city, built over the old Inca square of Huacaypata. The Cathedral holds one of the finest collections of Cusco School painting.",
          "O coração da cidade, sobre a antiga praça inca de Huacaypata. A Catedral guarda uma das melhores coleções de pintura da Escola Cusquenha."
        ),
        tour: "city-tour-cusco",
      },
      {
        nombre: t("Qorikancha", "Qorikancha", "Qorikancha"),
        texto: t(
          "El templo del Sol, el más importante del imperio. Sobre sus muros incas se construyó el convento de Santo Domingo, y los dos se visitan juntos.",
          "The Temple of the Sun, the most important in the empire. The Santo Domingo convent was built on top of its Inca walls, and both are visited together.",
          "O templo do Sol, o mais importante do império. Sobre seus muros incas foi construído o convento de Santo Domingo, e os dois são visitados juntos."
        ),
        tour: "qorikancha-museo",
      },
      {
        nombre: t("Sacsayhuamán", "Sacsayhuamán", "Sacsayhuamán"),
        texto: t(
          "Fortaleza ceremonial en lo alto de la ciudad, con bloques de piedra de varias toneladas. Cada 24 de junio acoge la escenificación del Inti Raymi, la fiesta del Sol.",
          "A ceremonial fortress above the city, made of stone blocks weighing several tonnes. Every 24 June it hosts the re-enactment of Inti Raymi, the Festival of the Sun.",
          "Fortaleza cerimonial no alto da cidade, com blocos de pedra de várias toneladas. Todo 24 de junho recebe a encenação do Inti Raymi, a festa do Sol."
        ),
        tour: "cusco-sacsayhuaman",
      },
      {
        nombre: t("San Blas y la piedra de los doce ángulos", "San Blas and the twelve-angled stone", "San Blas e a pedra dos doze ângulos"),
        texto: t(
          "Calles empinadas de talleres de artesanos y, a pocos pasos, la calle Hatun Rumiyoc, donde está la famosa piedra inca de doce ángulos.",
          "Steep streets full of artisan workshops and, a few steps away, Hatun Rumiyoc street, home to the famous twelve-angled Inca stone.",
          "Ruas íngremes cheias de oficinas de artesãos e, a poucos passos, a rua Hatun Rumiyoc, onde fica a famosa pedra inca de doze ângulos."
        ),
        tour: "cusco-fotografico",
      },
      {
        nombre: t("Mercado de San Pedro", "San Pedro Market", "Mercado de San Pedro"),
        texto: t(
          "El mercado central, para probar jugos, frutas andinas y la comida de todos los días de los cusqueños.",
          "The central market, the place to try fresh juices, Andean fruit and the everyday food of Cusco's locals.",
          "O mercado central, para provar sucos, frutas andinas e a comida do dia a dia dos cusquenhos."
        ),
        tour: "cusco-gastronomico",
      },
      {
        nombre: t("Montaña de Colores (Vinicunca)", "Rainbow Mountain (Vinicunca)", "Montanha Colorida (Vinicunca)"),
        texto: t(
          "A unas tres horas de la ciudad, una montaña de franjas rojas, ocres y verdes a más de 5000 metros. Es una excursión de día completo, exigente por la altura.",
          "About three hours from the city, a mountain striped in red, ochre and green at over 5,000 metres. It is a full-day excursion, demanding because of the altitude.",
          "A cerca de três horas da cidade, uma montanha de faixas vermelhas, ocres e verdes a mais de 5.000 metros. É um passeio de dia inteiro, exigente por causa da altitude."
        ),
        tour: "rainbow-mountain",
      },
    ],
    cuandoIr: [
      t(
        "La temporada seca, de mayo a octubre, trae días soleados y noches frías: es la mejor para caminar y ver las montañas despejadas, y también la más concurrida, sobre todo en junio, julio y agosto. Si quieres ver el Inti Raymi, el 24 de junio, reserva con varios meses de antelación.",
        "The dry season, from May to October, brings sunny days and cold nights: it is the best time for hiking and clear mountain views, and also the busiest, especially in June, July and August. If you want to see Inti Raymi on 24 June, book several months ahead.",
        "A estação seca, de maio a outubro, traz dias ensolarados e noites frias: é a melhor para caminhar e ver as montanhas sem nuvens, e também a mais movimentada, principalmente em junho, julho e agosto. Se quiser ver o Inti Raymi, em 24 de junho, reserve com vários meses de antecedência."
      ),
      t(
        "De diciembre a marzo llueve casi a diario, sobre todo por la tarde; los paisajes están más verdes y hay menos gente, pero algunas rutas de trekking se complican. Abril y noviembre son buenos meses intermedios.",
        "From December to March it rains almost every day, mostly in the afternoon; the landscape is greener and there are fewer visitors, but some trekking routes become harder. April and November are good in-between months.",
        "De dezembro a março chove quase todos os dias, principalmente à tarde; as paisagens ficam mais verdes e há menos gente, mas algumas trilhas ficam mais difíceis. Abril e novembro são bons meses intermediários."
      ),
    ],
    comoLlegar: [
      t(
        "Lo más habitual es en avión desde Lima: el vuelo dura algo más de una hora y llega al aeropuerto Alejandro Velasco Astete, a unos 20 minutos del centro. También hay buses desde Lima, Arequipa y Puno, aunque por tierra desde Lima el viaje supera las 20 horas.",
        "Most travellers fly in from Lima: the flight takes just over an hour and lands at Alejandro Velasco Astete airport, about 20 minutes from the centre. There are also buses from Lima, Arequipa and Puno, although overland from Lima the journey takes more than 20 hours.",
        "O mais comum é chegar de avião desde Lima: o voo dura pouco mais de uma hora e chega ao aeroporto Alejandro Velasco Astete, a uns 20 minutos do centro. Também há ônibus desde Lima, Arequipa e Puno, embora por terra desde Lima a viagem passe de 20 horas."
      ),
      t(
        "Dentro del centro histórico casi todo se recorre a pie, y para las excursiones lo más cómodo es un tour con recojo en el hotel.",
        "Almost everything in the historic centre can be reached on foot, and for excursions the easiest option is a tour with hotel pick-up.",
        "Dentro do centro histórico quase tudo se percorre a pé, e para os passeios o mais prático é um tour com busca no hotel."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuántos días necesito en Cusco?", "How many days do I need in Cusco?", "Quantos dias preciso em Cusco?"),
        respuesta: t(
          "Lo recomendable son al menos cuatro o cinco: uno para aclimatarte y recorrer la ciudad, uno para el Valle Sagrado, uno para Machu Picchu y uno más para una excursión como la Montaña de Colores o la laguna Humantay.",
          "We recommend at least four or five: one to acclimatise and explore the city, one for the Sacred Valley, one for Machu Picchu and one more for an excursion such as Rainbow Mountain or Humantay Lake.",
          "O recomendável são pelo menos quatro ou cinco: um para se aclimatar e conhecer a cidade, um para o Vale Sagrado, um para Machu Picchu e mais um para um passeio como a Montanha Colorida ou a lagoa Humantay."
        ),
      },
      {
        pregunta: t("¿Cómo evito el mal de altura?", "How can I avoid altitude sickness?", "Como evitar o mal da altitude?"),
        respuesta: t(
          "Los primeros días camina despacio, bebe mucha agua, come ligero y deja el alcohol para después; el mate de coca ayuda. Empieza por excursiones a menor altura, como el Valle Sagrado, y deja las de más de 4000 metros para el final.",
          "For the first few days walk slowly, drink plenty of water, eat light and leave alcohol for later; coca tea helps. Start with lower excursions such as the Sacred Valley and save those above 4,000 metres for the end.",
          "Nos primeiros dias caminhe devagar, beba bastante água, coma leve e deixe o álcool para depois; o chá de coca ajuda. Comece pelos passeios mais baixos, como o Vale Sagrado, e deixe os de mais de 4.000 metros para o final."
        ),
      },
      {
        pregunta: t("¿Qué es el boleto turístico de Cusco?", "What is the Cusco tourist ticket?", "O que é o boleto turístico de Cusco?"),
        respuesta: t(
          "Es una entrada conjunta a varios sitios arqueológicos y museos de Cusco y del Valle Sagrado, como Sacsayhuamán, Pisac, Ollantaytambo o Moray. En cada tour te indicamos si está incluida o si hay que comprarla aparte.",
          "It is a combined pass to several archaeological sites and museums in Cusco and the Sacred Valley, such as Sacsayhuamán, Pisac, Ollantaytambo and Moray. For each tour we tell you whether it is included or has to be bought separately.",
          "É um ingresso conjunto para vários sítios arqueológicos e museus de Cusco e do Vale Sagrado, como Sacsayhuamán, Pisac, Ollantaytambo e Moray. Em cada tour informamos se está incluído ou se deve ser comprado à parte."
        ),
      },
      {
        pregunta: t("¿Es seguro viajar a Cusco?", "Is Cusco safe to visit?", "É seguro viajar para Cusco?"),
        respuesta: t(
          "Cusco es una ciudad turística y tranquila. Basta con las precauciones de cualquier ciudad: cuidar tus pertenencias en mercados y lugares concurridos y usar taxis o traslados de confianza, sobre todo de noche.",
          "Cusco is a calm, tourist-friendly city. The usual city precautions are enough: watch your belongings in markets and crowded places and use trusted taxis or transfers, especially at night.",
          "Cusco é uma cidade turística e tranquila. Bastam os cuidados de qualquer cidade: atenção aos seus pertences em mercados e lugares cheios e usar táxis ou traslados de confiança, principalmente à noite."
        ),
      },
    ],
  },

  "valle-sagrado": {
    cerca: ["cusco", "machu-picchu"],
    intro: [
      t(
        "El Valle Sagrado de los Incas es el valle del río Urubamba, entre Cusco y Machu Picchu. Fue una de las zonas agrícolas más importantes del imperio y conserva pueblos andinos, andenes en las laderas y algunos de los restos incas mejor cuidados del Perú.",
        "The Sacred Valley of the Incas is the valley of the Urubamba River, between Cusco and Machu Picchu. It was one of the empire's most important farming areas and still has Andean villages, terraced hillsides and some of the best-preserved Inca sites in Peru.",
        "O Vale Sagrado dos Incas é o vale do rio Urubamba, entre Cusco e Machu Picchu. Foi uma das áreas agrícolas mais importantes do império e conserva vilas andinas, terraços nas encostas e alguns dos sítios incas mais bem conservados do Peru."
      ),
      t(
        "Está más bajo que Cusco, entre unos 2800 y 3000 metros, por eso es un buen primer destino para aclimatarse. Se puede visitar en un día completo desde Cusco o dormir allí y seguir en tren hacia Machu Picchu desde Ollantaytambo.",
        "It is lower than Cusco, at roughly 2,800 to 3,000 metres, which makes it a good first stop to acclimatise. You can see it on a full-day trip from Cusco, or stay overnight and take the train to Machu Picchu from Ollantaytambo.",
        "Fica mais baixo que Cusco, entre cerca de 2.800 e 3.000 metros, por isso é um bom primeiro destino para se aclimatar. Dá para conhecê-lo em um dia inteiro saindo de Cusco ou dormir lá e seguir de trem para Machu Picchu a partir de Ollantaytambo."
      ),
    ],
    queVer: [
      {
        nombre: t("Pisac", "Pisac", "Pisac"),
        texto: t(
          "Mercado artesanal en el pueblo y, en lo alto, un gran complejo arqueológico con andenes que bajan por la montaña.",
          "A craft market in the village and, high above it, a large archaeological complex with terraces running down the mountainside.",
          "Mercado de artesanato na vila e, no alto, um grande complexo arqueológico com terraços que descem pela montanha."
        ),
        tour: "valle-sagrado-pisac",
      },
      {
        nombre: t("Ollantaytambo", "Ollantaytambo", "Ollantaytambo"),
        texto: t(
          "Pueblo inca que sigue habitado, con su trazado de calles original y una fortaleza de terrazas. De aquí sale el tren a Machu Picchu.",
          "An Inca town that is still lived in, with its original street grid and a terraced fortress. The train to Machu Picchu leaves from here.",
          "Povoado inca ainda habitado, com o traçado original das ruas e uma fortaleza em terraços. Daqui sai o trem para Machu Picchu."
        ),
        tour: "valle-sagrado-ollantaytambo",
      },
      {
        nombre: t("Moray", "Moray", "Moray"),
        texto: t(
          "Andenes circulares excavados en la tierra que, según se cree, los incas usaban para experimentar con cultivos a distintas temperaturas.",
          "Circular terraces dug into the ground which the Incas are believed to have used to experiment with crops at different temperatures.",
          "Terraços circulares escavados na terra que, acredita-se, os incas usavam para experimentar cultivos em temperaturas diferentes."
        ),
        tour: "salineras-maras-moray",
      },
      {
        nombre: t("Salineras de Maras", "Maras salt mines", "Salinas de Maras"),
        texto: t(
          "Cientos de pozas de sal escalonadas en la ladera, que las familias de la zona siguen trabajando como hace siglos.",
          "Hundreds of salt pans stepped down the hillside, still worked by local families as they have been for centuries.",
          "Centenas de piscinas de sal escalonadas na encosta, que as famílias da região continuam trabalhando como há séculos."
        ),
        tour: "valle-sagrado-maras-moray",
      },
      {
        nombre: t("Chinchero", "Chinchero", "Chinchero"),
        texto: t(
          "Pueblo de tejedoras, con una iglesia colonial sobre bases incas y demostraciones de teñido natural de la lana.",
          "A weaving village with a colonial church built on Inca foundations and demonstrations of natural wool dyeing.",
          "Vila de tecelãs, com uma igreja colonial sobre bases incas e demonstrações de tingimento natural da lã."
        ),
        tour: "valle-sagrado-full-day",
      },
      {
        nombre: t("Rafting en el río Urubamba", "Rafting on the Urubamba River", "Rafting no rio Urubamba"),
        texto: t(
          "Tramos de aguas bravas aptos para principiantes y familias: una forma distinta de ver el valle.",
          "White-water stretches suitable for beginners and families: a different way to see the valley.",
          "Trechos de corredeiras para iniciantes e famílias: um jeito diferente de ver o vale."
        ),
        tour: "rafting-urubamba",
      },
    ],
    cuandoIr: [
      t(
        "De mayo a octubre el valle está seco y soleado, ideal para recorrer los sitios arqueológicos sin barro. Al estar más bajo que Cusco, las temperaturas son algo más suaves durante todo el año.",
        "From May to October the valley is dry and sunny, ideal for exploring the archaeological sites without mud. Being lower than Cusco, temperatures are somewhat milder all year round.",
        "De maio a outubro o vale fica seco e ensolarado, ideal para percorrer os sítios arqueológicos sem barro. Por ficar mais baixo que Cusco, as temperaturas são um pouco mais amenas o ano todo."
      ),
      t(
        "En la temporada de lluvias, de diciembre a marzo, los andenes y los campos se ponen muy verdes. Las lluvias suelen llegar por la tarde, así que conviene empezar temprano.",
        "In the rainy season, from December to March, the terraces and fields turn deep green. Rain usually comes in the afternoon, so it is best to start early.",
        "Na estação das chuvas, de dezembro a março, os terraços e os campos ficam muito verdes. As chuvas costumam chegar à tarde, então é melhor começar cedo."
      ),
    ],
    comoLlegar: [
      t(
        "Pisac está a algo menos de una hora de Cusco por carretera, y Urubamba y Ollantaytambo, a entre hora y media y dos horas. Lo más cómodo es un tour de día completo, con transporte y guía, o un traslado privado si quieres quedarte a dormir en el valle.",
        "Pisac is a little under an hour from Cusco by road, and Urubamba and Ollantaytambo between an hour and a half and two hours. The easiest option is a full-day tour with transport and guide, or a private transfer if you want to stay overnight in the valley.",
        "Pisac fica a pouco menos de uma hora de Cusco de carro, e Urubamba e Ollantaytambo, entre uma hora e meia e duas horas. O mais prático é um tour de dia inteiro, com transporte e guia, ou um traslado privado se quiser dormir no vale."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Se puede ver el Valle Sagrado en un día?", "Can you see the Sacred Valley in one day?", "Dá para conhecer o Vale Sagrado em um dia?"),
        respuesta: t(
          "Sí. Un tour de día completo suele recorrer Pisac, Ollantaytambo y Chinchero y vuelve a Cusco por la noche. Si quieres ir sin prisas, o seguir hacia Machu Picchu, mejor en dos días durmiendo en el valle.",
          "Yes. A full-day tour usually covers Pisac, Ollantaytambo and Chinchero and returns to Cusco in the evening. If you prefer a slower pace, or are continuing to Machu Picchu, two days with a night in the valley is better.",
          "Sim. Um tour de dia inteiro costuma passar por Pisac, Ollantaytambo e Chinchero e volta a Cusco à noite. Se quiser ir sem pressa, ou seguir para Machu Picchu, o melhor são dois dias dormindo no vale."
        ),
      },
      {
        pregunta: t("¿Conviene dormir en el Valle Sagrado antes de Machu Picchu?", "Is it worth staying in the Sacred Valley before Machu Picchu?", "Vale a pena dormir no Vale Sagrado antes de Machu Picchu?"),
        respuesta: t(
          "Es una buena idea: al estar más bajo que Cusco se duerme mejor, y desde Ollantaytambo el tren a Aguas Calientes tarda alrededor de hora y media.",
          "It is a good idea: being lower than Cusco you sleep better, and from Ollantaytambo the train to Aguas Calientes takes around an hour and a half.",
          "É uma boa ideia: por ficar mais baixo que Cusco, dorme-se melhor, e de Ollantaytambo o trem até Aguas Calientes leva cerca de uma hora e meia."
        ),
      },
      {
        pregunta: t("¿Qué diferencia hay entre Maras y Moray?", "What is the difference between Maras and Moray?", "Qual a diferença entre Maras e Moray?"),
        respuesta: t(
          "Son dos sitios distintos y cercanos: Moray son los andenes circulares incas y Maras, las salineras. Casi siempre se visitan juntos en medio día.",
          "They are two separate sites close to each other: Moray is the circular Inca terraces and Maras is the salt mines. They are almost always visited together in half a day.",
          "São dois lugares diferentes e próximos: Moray são os terraços circulares incas e Maras, as salinas. Quase sempre são visitados juntos em meio dia."
        ),
      },
      {
        pregunta: t("¿Hace falta el boleto turístico?", "Do I need the tourist ticket?", "Preciso do boleto turístico?"),
        respuesta: t(
          "Pisac, Ollantaytambo, Chinchero y Moray entran en el boleto turístico de Cusco; las salineras de Maras tienen una entrada aparte.",
          "Pisac, Ollantaytambo, Chinchero and Moray are covered by the Cusco tourist ticket; the Maras salt mines have a separate entrance fee.",
          "Pisac, Ollantaytambo, Chinchero e Moray fazem parte do boleto turístico de Cusco; as salinas de Maras têm ingresso à parte."
        ),
      },
    ],
  },

  "machu-picchu": {
    cerca: ["cusco", "valle-sagrado"],
    intro: [
      t(
        "Machu Picchu es la ciudadela inca construida en el siglo XV en lo alto de una montaña sobre el río Urubamba, rodeada de bosque nuboso. Es Patrimonio de la Humanidad desde 1983 y una de las nuevas siete maravillas del mundo, y para muchos viajeros es la razón del viaje al Perú.",
        "Machu Picchu is the Inca citadel built in the 15th century on a mountaintop above the Urubamba River, surrounded by cloud forest. It has been a World Heritage Site since 1983 and is one of the New Seven Wonders of the World; for many travellers it is the reason for the whole trip to Peru.",
        "Machu Picchu é a cidadela inca construída no século XV no alto de uma montanha sobre o rio Urubamba, cercada de floresta nublada. É Patrimônio da Humanidade desde 1983 e uma das novas sete maravilhas do mundo, e para muitos viajantes é o motivo da viagem ao Peru."
      ),
      t(
        "Está a unos 2400 metros de altura, más bajo que Cusco. Se llega en tren hasta Aguas Calientes, el pueblo al pie de la montaña, y desde allí en bus o a pie hasta la entrada. Las entradas son nominativas, con horario y por circuito, y se agotan en temporada alta: conviene reservar con tiempo.",
        "It lies at about 2,400 metres, lower than Cusco. You reach it by train to Aguas Calientes, the town at the foot of the mountain, and from there by bus or on foot up to the entrance. Tickets are issued in your name, with a set time and circuit, and they sell out in high season, so book well in advance.",
        "Fica a cerca de 2.400 metros de altitude, mais baixo que Cusco. Chega-se de trem até Aguas Calientes, a vila ao pé da montanha, e de lá de ônibus ou a pé até a entrada. Os ingressos são nominais, com horário e por circuito, e esgotam na alta temporada: é melhor reservar com antecedência."
      ),
    ],
    queVer: [
      {
        nombre: t("La ciudadela", "The citadel", "A cidadela"),
        texto: t(
          "Templos, plazas, viviendas y andenes conectados por escalinatas. La visita sigue circuitos marcados, y con un guía se entiende mucho mejor lo que se ve.",
          "Temples, plazas, houses and terraces linked by stone stairways. Visits follow set circuits, and a guide makes it far easier to understand what you are looking at.",
          "Templos, praças, moradias e terraços ligados por escadarias. A visita segue circuitos marcados, e com um guia se entende muito melhor o que se vê."
        ),
        tour: "machu-picchu-clasico",
      },
      {
        nombre: t("Templo del Sol e Intihuatana", "Temple of the Sun and Intihuatana", "Templo do Sol e Intihuatana"),
        texto: t(
          "Dos de las construcciones más cuidadas, ligadas a la observación del sol y al calendario agrícola.",
          "Two of the finest structures on the site, linked to watching the sun and to the farming calendar.",
          "Duas das construções mais bem-acabadas, ligadas à observação do sol e ao calendário agrícola."
        ),
      },
      {
        nombre: t("Montaña Huayna Picchu", "Huayna Picchu mountain", "Montanha Huayna Picchu"),
        texto: t(
          "El pico que aparece detrás en las fotos clásicas. La subida es empinada, dura alrededor de una hora y tiene cupos diarios muy limitados.",
          "The peak behind the citadel in the classic photos. The climb is steep, takes about an hour and has very limited daily permits.",
          "O pico que aparece atrás nas fotos clássicas. A subida é íngreme, leva cerca de uma hora e tem vagas diárias muito limitadas."
        ),
        tour: "machu-picchu-huayna-picchu",
      },
      {
        nombre: t("Montaña Machu Picchu", "Machu Picchu Mountain", "Montanha Machu Picchu"),
        texto: t(
          "Más alta que Huayna Picchu, con un camino más largo pero menos expuesto y vistas de toda la ciudadela y del valle.",
          "Higher than Huayna Picchu, with a longer but less exposed trail and views over the whole citadel and valley.",
          "Mais alta que Huayna Picchu, com uma trilha mais longa porém menos exposta e vista de toda a cidadela e do vale."
        ),
        tour: "machu-picchu-montana",
      },
      {
        nombre: t("Camino Inca", "Inca Trail", "Trilha Inca"),
        texto: t(
          "La ruta a pie de los incas: cuatro días entre montañas y restos arqueológicos, o una versión corta de dos, para entrar a Machu Picchu por la Puerta del Sol.",
          "The Incas' own footpath: four days through mountains and ruins, or a short two-day version, arriving at Machu Picchu through the Sun Gate.",
          "O caminho a pé dos incas: quatro dias entre montanhas e ruínas, ou uma versão curta de dois, para entrar em Machu Picchu pela Porta do Sol."
        ),
        tour: "camino-inca-clasico",
      },
      {
        nombre: t("Aguas Calientes", "Aguas Calientes", "Aguas Calientes"),
        texto: t(
          "El pueblo al pie de la montaña, con aguas termales, restaurantes y mercado de artesanía. Es donde se duerme para entrar a la ciudadela a primera hora.",
          "The town at the foot of the mountain, with hot springs, restaurants and a craft market. It is where you stay to enter the citadel first thing in the morning.",
          "A vila ao pé da montanha, com águas termais, restaurantes e mercado de artesanato. É onde se dorme para entrar na cidadela logo cedo."
        ),
        tour: "machu-picchu-valle-sagrado",
      },
    ],
    cuandoIr: [
      t(
        "De abril a octubre es la temporada seca y la de cielos más despejados; junio, julio y agosto son los meses con más visitantes. De noviembre a marzo llueve con frecuencia y la niebla puede tapar la vista a ratos, aunque suele levantarse a lo largo de la mañana.",
        "April to October is the dry season with the clearest skies; June, July and August are the busiest months. From November to March it rains often and mist can hide the view at times, although it usually lifts during the morning.",
        "De abril a outubro é a estação seca e a de céu mais limpo; junho, julho e agosto são os meses com mais visitantes. De novembro a março chove com frequência e a neblina pode cobrir a vista em alguns momentos, embora costume abrir ao longo da manhã."
      ),
      t(
        "El Camino Inca de cuatro días cierra cada febrero por mantenimiento; la ciudadela sigue abierta todo el año.",
        "The four-day Inca Trail closes every February for maintenance; the citadel itself stays open all year.",
        "A Trilha Inca de quatro dias fecha todo mês de fevereiro para manutenção; a cidadela continua aberta o ano todo."
      ),
    ],
    comoLlegar: [
      t(
        "El tren a Aguas Calientes sale de la estación de Poroy, a las afueras de Cusco (unas tres horas y media), o de Ollantaytambo, en el Valle Sagrado (alrededor de hora y media), que es lo más habitual combinándolo con la carretera desde Cusco.",
        "The train to Aguas Calientes leaves from Poroy station on the outskirts of Cusco (about three and a half hours) or from Ollantaytambo in the Sacred Valley (around an hour and a half), which is the most common option, combined with the road from Cusco.",
        "O trem para Aguas Calientes sai da estação de Poroy, nos arredores de Cusco (cerca de três horas e meia), ou de Ollantaytambo, no Vale Sagrado (cerca de uma hora e meia), que é o mais comum, combinado com a estrada desde Cusco."
      ),
      t(
        "Desde Aguas Calientes, los buses suben a la entrada en unos 25 minutos; también se puede subir a pie por un camino de escaleras de una hora y media, aproximadamente.",
        "From Aguas Calientes, buses take about 25 minutes up to the entrance; you can also walk up a stepped trail in roughly an hour and a half.",
        "De Aguas Calientes, os ônibus sobem até a entrada em uns 25 minutos; também é possível subir a pé por uma trilha de escadas de cerca de uma hora e meia."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Con cuánta antelación hay que reservar?", "How far in advance should I book?", "Com quanta antecedência devo reservar?"),
        respuesta: t(
          "Cuanto antes: en temporada alta, de mayo a septiembre, las entradas, y sobre todo los cupos de Huayna Picchu, se agotan con semanas o meses de antelación. Escríbenos con tus fechas y te confirmamos la disponibilidad.",
          "As early as possible: in high season, from May to September, tickets, and Huayna Picchu permits in particular, sell out weeks or months ahead. Send us your dates and we will confirm availability.",
          "O quanto antes: na alta temporada, de maio a setembro, os ingressos, e principalmente as vagas de Huayna Picchu, esgotam com semanas ou meses de antecedência. Mande suas datas e confirmamos a disponibilidade."
        ),
      },
      {
        pregunta: t("¿En un día desde Cusco o con noche en Aguas Calientes?", "In one day from Cusco or with a night in Aguas Calientes?", "Em um dia saindo de Cusco ou com noite em Aguas Calientes?"),
        respuesta: t(
          "Se puede en un día, pero es una jornada larga, de madrugada a noche. Dormir en Aguas Calientes o en el Valle Sagrado permite visitar la ciudadela con calma y a primera hora.",
          "It can be done in a day, but it is a long one, from before dawn until night. Staying in Aguas Calientes or the Sacred Valley lets you visit the citadel calmly and early in the morning.",
          "Dá para fazer em um dia, mas é uma jornada longa, da madrugada à noite. Dormir em Aguas Calientes ou no Vale Sagrado permite visitar a cidadela com calma e logo cedo."
        ),
      },
      {
        pregunta: t("¿Hace falta estar en forma?", "Do I need to be fit?", "Preciso estar em forma?"),
        respuesta: t(
          "Para la ciudadela basta con poder subir escaleras a paso tranquilo. Huayna Picchu, la montaña Machu Picchu y el Camino Inca sí piden buena condición física.",
          "For the citadel it is enough to be able to climb stairs at a gentle pace. Huayna Picchu, Machu Picchu Mountain and the Inca Trail do require good fitness.",
          "Para a cidadela basta conseguir subir escadas em ritmo tranquilo. Huayna Picchu, a montanha Machu Picchu e a Trilha Inca exigem bom preparo físico."
        ),
      },
      {
        pregunta: t("¿Qué tengo que llevar?", "What should I bring?", "O que devo levar?"),
        respuesta: t(
          "El pasaporte, que piden en la entrada, protector solar, repelente, una capa para la lluvia y agua. No se permiten mochilas grandes, así que mejor una pequeña.",
          "Your passport, which is checked at the entrance, sunscreen, insect repellent, a rain poncho and water. Large backpacks are not allowed, so bring a small one.",
          "O passaporte, que pedem na entrada, protetor solar, repelente, uma capa de chuva e água. Mochilas grandes não são permitidas, então leve uma pequena."
        ),
      },
    ],
  },

  arequipa: {
    cerca: ["colca", "puno"],
    intro: [
      t(
        "Arequipa es la segunda ciudad del Perú y una de las más bonitas: su centro histórico, Patrimonio de la Humanidad desde el año 2000, está construido con sillar, una piedra volcánica blanca que le da el nombre de Ciudad Blanca. La vigilan tres volcanes, el Misti, el Chachani y el Pichu Pichu.",
        "Arequipa is Peru's second city and one of its most beautiful: its historic centre, a World Heritage Site since 2000, is built from sillar, a white volcanic stone that earned it the name of the White City. Three volcanoes watch over it: El Misti, Chachani and Pichu Pichu.",
        "Arequipa é a segunda cidade do Peru e uma das mais bonitas: seu centro histórico, Patrimônio da Humanidade desde 2000, é construído com sillar, uma pedra vulcânica branca que lhe deu o nome de Cidade Branca. Três vulcões a observam: o Misti, o Chachani e o Pichu Pichu."
      ),
      t(
        "Está a unos 2300 metros, más baja que Cusco, y tiene sol casi todo el año. Es además la puerta de entrada al Cañón del Colca, donde se ven cóndores en vuelo, y una parada natural en la ruta entre Lima, Puno y Cusco.",
        "It sits at around 2,300 metres, lower than Cusco, and enjoys sunshine almost all year. It is also the gateway to the Colca Canyon, where you can watch condors in flight, and a natural stop on the route between Lima, Puno and Cusco.",
        "Fica a cerca de 2.300 metros, mais baixa que Cusco, e tem sol quase o ano todo. É também a porta de entrada do Cânion do Colca, onde se veem condores em voo, e uma parada natural na rota entre Lima, Puno e Cusco."
      ),
    ],
    queVer: [
      {
        nombre: t("Monasterio de Santa Catalina", "Santa Catalina Monastery", "Mosteiro de Santa Catalina"),
        texto: t(
          "Una pequeña ciudad dentro de la ciudad: calles, patios y celdas de colores fundados en el siglo XVI, donde vivieron monjas de clausura durante siglos.",
          "A small city within the city: colourful streets, courtyards and cells founded in the 16th century, home to cloistered nuns for centuries.",
          "Uma pequena cidade dentro da cidade: ruas, pátios e celas coloridas fundados no século XVI, onde viveram freiras de clausura durante séculos."
        ),
        tour: "santa-catalina",
      },
      {
        nombre: t("Plaza de Armas y Catedral", "Plaza de Armas and the Cathedral", "Plaza de Armas e Catedral"),
        texto: t(
          "Una de las plazas más armoniosas del país, rodeada de portales de sillar, con el Misti al fondo en los días claros.",
          "One of the most harmonious squares in the country, framed by sillar arcades, with El Misti in the background on clear days.",
          "Uma das praças mais harmoniosas do país, cercada de arcadas de sillar, com o Misti ao fundo nos dias claros."
        ),
        tour: "city-tour-arequipa",
      },
      {
        nombre: t("Miradores de Yanahuara y Carmen Alto", "Yanahuara and Carmen Alto viewpoints", "Mirantes de Yanahuara e Carmen Alto"),
        texto: t(
          "Arcos de sillar y campiña con vistas a los volcanes, a pocos minutos del centro.",
          "Sillar arches and countryside with views of the volcanoes, a few minutes from the centre.",
          "Arcos de sillar e campo com vista para os vulcões, a poucos minutos do centro."
        ),
        tour: "city-tour-arequipa",
      },
      {
        nombre: t("Ruta del Sillar", "Sillar Route", "Rota do Sillar"),
        texto: t(
          "Las canteras de donde sale la piedra blanca de la ciudad, con grabados tallados en la roca y la quebrada de Culebrillas.",
          "The quarries where the city's white stone comes from, with carvings in the rock and the Culebrillas ravine.",
          "As pedreiras de onde sai a pedra branca da cidade, com relevos esculpidos na rocha e a garganta de Culebrillas."
        ),
        tour: "ruta-sillar",
      },
      {
        nombre: t("Cañón del Colca y Cruz del Cóndor", "Colca Canyon and Cruz del Cóndor", "Cânion do Colca e Cruz del Cóndor"),
        texto: t(
          "Uno de los cañones más profundos del mundo. Desde el mirador de la Cruz del Cóndor se ve a los cóndores planear, sobre todo por la mañana.",
          "One of the deepest canyons in the world. From the Cruz del Cóndor viewpoint you can watch condors gliding, especially in the morning.",
          "Um dos cânions mais profundos do mundo. Do mirante da Cruz del Cóndor se veem os condores planando, principalmente de manhã."
        ),
        tour: "colca-canyon",
      },
      {
        nombre: t("Volcán Misti", "El Misti volcano", "Vulcão Misti"),
        texto: t(
          "Para montañistas: dos días de ascenso hasta la cumbre, a más de 5800 metros, con vistas de toda la ciudad.",
          "For mountaineers: a two-day climb to the summit, at over 5,800 metres, with views over the whole city.",
          "Para montanhistas: dois dias de subida até o cume, a mais de 5.800 metros, com vista de toda a cidade."
        ),
        tour: "misti-climb",
      },
    ],
    cuandoIr: [
      t(
        "Arequipa tiene buen tiempo casi todo el año. De abril a noviembre el cielo está despejado y es la mejor época para el Colca y el Misti.",
        "Arequipa has good weather almost all year. From April to November the skies are clear, and it is the best time for the Colca Canyon and El Misti.",
        "Arequipa tem bom tempo quase o ano todo. De abril a novembro o céu fica limpo e é a melhor época para o Colca e o Misti."
      ),
      t(
        "Entre enero y marzo pueden caer lluvias en la ciudad y, sobre todo, en la sierra, y el camino al Colca se vuelve más lento.",
        "Between January and March there can be rain in the city and, above all, in the highlands, and the road to the Colca becomes slower.",
        "Entre janeiro e março pode chover na cidade e, principalmente, na serra, e o caminho para o Colca fica mais lento."
      ),
    ],
    comoLlegar: [
      t(
        "En avión desde Lima, en alrededor de hora y media, o desde Cusco. Por tierra hay buses desde Lima, Cusco y Puno (unas seis horas).",
        "By plane from Lima, in around an hour and a half, or from Cusco. Overland there are buses from Lima, Cusco and Puno (about six hours).",
        "De avião desde Lima, em cerca de uma hora e meia, ou desde Cusco. Por terra há ônibus desde Lima, Cusco e Puno (cerca de seis horas)."
      ),
      t(
        "El Colca está a unas tres horas por carretera hasta Chivay; lo habitual es visitarlo en un tour de uno o dos días desde Arequipa.",
        "The Colca is about three hours by road to Chivay; most people visit it on a one- or two-day tour from Arequipa.",
        "O Colca fica a cerca de três horas de estrada até Chivay; o comum é visitá-lo em um tour de um ou dois dias saindo de Arequipa."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuántos días pasar en Arequipa?", "How many days should I spend in Arequipa?", "Quantos dias ficar em Arequipa?"),
        respuesta: t(
          "Al menos tres: uno para la ciudad y Santa Catalina y dos para el Cañón del Colca, que se disfruta mucho más con una noche allí. Si quieres subir el Misti, suma dos días más.",
          "At least three: one for the city and Santa Catalina and two for the Colca Canyon, which is much more enjoyable with a night there. If you want to climb El Misti, add two more days.",
          "Pelo menos três: um para a cidade e Santa Catalina e dois para o Cânion do Colca, que se aproveita muito mais com uma noite lá. Se quiser subir o Misti, acrescente mais dois dias."
        ),
      },
      {
        pregunta: t("¿El Colca en uno o en dos días?", "Colca Canyon in one day or two?", "O Colca em um ou dois dias?"),
        respuesta: t(
          "Se puede en uno, saliendo de madrugada para llegar a la Cruz del Cóndor por la mañana, pero son muchas horas de bus. En dos días se duerme en el valle, hay tiempo para los baños termales y el viaje es mucho más tranquilo.",
          "It can be done in one, leaving before dawn to reach Cruz del Cóndor in the morning, but it means many hours on the bus. Over two days you sleep in the valley, have time for the hot springs and the trip is much more relaxed.",
          "Dá para fazer em um, saindo de madrugada para chegar à Cruz del Cóndor de manhã, mas são muitas horas de ônibus. Em dois dias se dorme no vale, sobra tempo para as termas e a viagem é muito mais tranquila."
        ),
      },
      {
        pregunta: t("¿Hay mal de altura en Arequipa?", "Is there altitude sickness in Arequipa?", "Há mal da altitude em Arequipa?"),
        respuesta: t(
          "En la ciudad casi no se nota, porque está a unos 2300 metros. En el camino al Colca se pasa por zonas de más de 4800 metros, así que conviene ir hidratado y sin prisa.",
          "In the city you barely notice it, as it lies at about 2,300 metres. On the way to the Colca the road crosses areas above 4,800 metres, so stay hydrated and take it easy.",
          "Na cidade quase não se sente, porque fica a cerca de 2.300 metros. No caminho para o Colca passa-se por áreas acima de 4.800 metros, então vá hidratado e sem pressa."
        ),
      },
      {
        pregunta: t("¿Qué comida típica probar?", "What local food should I try?", "Que comida típica provar?"),
        respuesta: t(
          "El rocoto relleno, el chupe de camarones, el adobo arequipeño de los domingos y el queso helado, que en realidad es un helado. Las picanterías son el lugar para probarlos.",
          "Rocoto relleno (stuffed hot pepper), chupe de camarones (shrimp chowder), the Sunday adobo arequipeño and queso helado, which is actually an ice cream. Traditional picanterías are the place to try them.",
          "O rocoto relleno, o chupe de camarones, o adobo arequipeño de domingo e o queso helado, que na verdade é um sorvete. As picanterías são o lugar para prová-los."
        ),
      },
    ],
  },

  lima: {
    cerca: ["nazca", "norte", "amazonia"],
    intro: [
      t(
        "Lima es la capital del Perú y la ciudad por la que llegan casi todos los viajeros. Fundada en 1535 junto al océano Pacífico, su centro histórico —Patrimonio de la Humanidad— reúne iglesias barrocas, balcones de madera tallada y casonas virreinales, mientras Miraflores y Barranco miran al mar desde lo alto de los acantilados.",
        "Lima is Peru's capital and the city where almost every traveller arrives. Founded in 1535 beside the Pacific Ocean, its historic centre —a World Heritage Site— gathers baroque churches, carved wooden balconies and colonial mansions, while Miraflores and Barranco look out to sea from the top of the cliffs.",
        "Lima é a capital do Peru e a cidade por onde chegam quase todos os viajantes. Fundada em 1535 junto ao oceano Pacífico, seu centro histórico —Patrimônio da Humanidade— reúne igrejas barrocas, balcões de madeira entalhada e casarões coloniais, enquanto Miraflores e Barranco olham para o mar do alto das falésias."
      ),
      t(
        "Es, sobre todo, la capital gastronómica de Sudamérica: el ceviche, la cocina nikkei y los mercados de barrio justifican por sí solos uno o dos días antes de volar a Cusco. Desde aquí salen también las excursiones por la costa sur a Paracas, Huacachina y las Líneas de Nazca.",
        "Above all, it is South America's food capital: ceviche, Nikkei cuisine and neighbourhood markets alone justify a day or two before flying on to Cusco. Excursions down the southern coast to Paracas, Huacachina and the Nazca Lines also start here.",
        "É, acima de tudo, a capital gastronômica da América do Sul: o ceviche, a cozinha nikkei e os mercados de bairro justificam sozinhos um ou dois dias antes de voar para Cusco. Daqui também saem as excursões pela costa sul a Paracas, Huacachina e às Linhas de Nazca."
      ),
    ],
    queVer: [
      {
        nombre: t("Plaza Mayor y centro histórico", "Plaza Mayor and the historic centre", "Plaza Mayor e centro histórico"),
        texto: t(
          "La Catedral, el Palacio de Gobierno y el cambio de guardia, rodeados de balcones de madera tallada de la época virreinal.",
          "The Cathedral, Government Palace and the changing of the guard, surrounded by carved wooden balconies from colonial times.",
          "A Catedral, o Palácio do Governo e a troca da guarda, cercados por balcões de madeira entalhada da época colonial."
        ),
        tour: "city-tour-lima",
      },
      {
        nombre: t("Convento de San Francisco", "San Francisco Monastery", "Convento de São Francisco"),
        texto: t(
          "Uno de los conjuntos barrocos más importantes de América, con una biblioteca antigua y catacumbas bajo la iglesia.",
          "One of the most important baroque complexes in the Americas, with an old library and catacombs beneath the church.",
          "Um dos conjuntos barrocos mais importantes da América, com uma biblioteca antiga e catacumbas sob a igreja."
        ),
        tour: "city-tour-lima",
      },
      {
        nombre: t("Miraflores y el Malecón", "Miraflores and the Malecón", "Miraflores e o Malecón"),
        texto: t(
          "Parques sobre los acantilados, el Parque del Amor y el Pacífico a los pies; en pleno barrio, la Huaca Pucllana, una pirámide de adobe anterior a los incas.",
          "Clifftop parks, the Parque del Amor and the Pacific below; right in the neighbourhood stands Huaca Pucllana, an adobe pyramid older than the Incas.",
          "Parques sobre as falésias, o Parque del Amor e o Pacífico aos pés; no meio do bairro, a Huaca Pucllana, uma pirâmide de adobe anterior aos incas."
        ),
        tour: "lima-barranco",
      },
      {
        nombre: t("Barranco", "Barranco", "Barranco"),
        texto: t(
          "El barrio bohemio de Lima: casonas de colores, el Puente de los Suspiros, murales, galerías de arte y bares con música.",
          "Lima's bohemian quarter: colourful mansions, the Bridge of Sighs, murals, art galleries and bars with live music.",
          "O bairro boêmio de Lima: casarões coloridos, a Ponte dos Suspiros, murais, galerias de arte e bares com música."
        ),
        tour: "lima-barranco",
      },
      {
        nombre: t("Cocina limeña", "Lima's food scene", "Cozinha limenha"),
        texto: t(
          "Mercados, cevicherías y bodegas de pisco: la mejor manera de entender por qué Lima se considera una de las capitales gastronómicas del mundo.",
          "Markets, cevicherías and pisco bars: the best way to understand why Lima is considered one of the food capitals of the world.",
          "Mercados, cevicherias e bares de pisco: a melhor forma de entender por que Lima é considerada uma das capitais gastronômicas do mundo."
        ),
        tour: "lima-gastronomico",
      },
      {
        nombre: t("Pachacamac", "Pachacamac", "Pachacamac"),
        texto: t(
          "Al sur de la ciudad, un gran santuario de adobe frente al mar que fue centro religioso de la costa durante más de mil años, también en tiempos de los incas.",
          "South of the city, a great adobe sanctuary facing the sea that was the coast's religious centre for over a thousand years, including in Inca times.",
          "Ao sul da cidade, um grande santuário de adobe de frente para o mar que foi centro religioso da costa por mais de mil anos, inclusive na época dos incas."
        ),
        tour: "pachacamac",
      },
    ],
    cuandoIr: [
      t(
        "En Lima casi nunca llueve. De diciembre a abril es verano: sol, calor —entre 25 y 30 grados— y tiempo de playa.",
        "It almost never rains in Lima. December to April is summer: sunshine, heat —between 25 and 30 °C— and beach weather.",
        "Em Lima quase nunca chove. De dezembro a abril é verão: sol, calor —entre 25 e 30 graus— e tempo de praia."
      ),
      t(
        "De junio a octubre el cielo se cubre de una neblina gris y húmeda, la garúa, y la temperatura ronda los 15 a 19 grados. No impide hacer nada, pero conviene una chaqueta ligera. La ciudad se visita bien todo el año.",
        "From June to October the sky is covered by a damp grey mist, the garúa, and temperatures hover around 15 to 19 °C. It stops nothing, but a light jacket helps. The city is worth visiting all year round.",
        "De junho a outubro o céu se cobre de uma névoa cinza e úmida, a garúa, e a temperatura fica entre 15 e 19 graus. Não atrapalha nada, mas vale levar uma jaqueta leve. A cidade se visita bem o ano todo."
      ),
    ],
    comoLlegar: [
      t(
        "El Aeropuerto Internacional Jorge Chávez, en el Callao, es la principal entrada al Perú, con vuelos directos desde América y Europa. Hasta Miraflores se tarda entre 40 minutos y más de una hora, según el tráfico.",
        "Jorge Chávez International Airport, in Callao, is Peru's main gateway, with direct flights from the Americas and Europe. Getting to Miraflores takes from 40 minutes to over an hour, depending on traffic.",
        "O Aeroporto Internacional Jorge Chávez, em Callao, é a principal porta de entrada do Peru, com voos diretos da América e da Europa. Até Miraflores leva de 40 minutos a mais de uma hora, conforme o trânsito."
      ),
      t(
        "Desde Lima hay vuelos a Cusco (algo más de una hora), Arequipa, Juliaca, Iquitos y el norte. Hacia Paracas y Nazca se viaja por la carretera Panamericana Sur, en bus o en tour.",
        "From Lima there are flights to Cusco (just over an hour), Arequipa, Juliaca, Iquitos and the north. Paracas and Nazca are reached along the Pan-American Highway South, by bus or on a tour.",
        "De Lima há voos para Cusco (pouco mais de uma hora), Arequipa, Juliaca, Iquitos e o norte. Para Paracas e Nazca se viaja pela rodovia Pan-Americana Sul, de ônibus ou em tour."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuántos días quedarse en Lima?", "How many days should I spend in Lima?", "Quantos dias ficar em Lima?"),
        respuesta: t(
          "Uno o dos. Un día alcanza para el centro histórico, Miraflores y Barranco; con dos hay tiempo para un museo, una comida sin prisa y Pachacamac. Si vas a Paracas o Nazca, suma uno o dos días más.",
          "One or two. A day is enough for the historic centre, Miraflores and Barranco; with two there is time for a museum, a long lunch and Pachacamac. If you are heading to Paracas or Nazca, add one or two more.",
          "Um ou dois. Um dia basta para o centro histórico, Miraflores e Barranco; com dois dá tempo para um museu, um almoço sem pressa e Pachacamac. Se for a Paracas ou Nazca, acrescente um ou dois dias."
        ),
      },
      {
        pregunta: t("¿Es segura Lima para el turista?", "Is Lima safe for tourists?", "Lima é segura para turistas?"),
        respuesta: t(
          "Miraflores, Barranco, San Isidro y el centro histórico de día son zonas tranquilas para pasear con las precauciones de cualquier gran ciudad: no lleves objetos de valor a la vista y muévete en taxis por aplicación o de empresa.",
          "Miraflores, Barranco, San Isidro and the historic centre by day are relaxed areas to walk around with the usual big-city precautions: keep valuables out of sight and use app-based or company taxis.",
          "Miraflores, Barranco, San Isidro e o centro histórico de dia são áreas tranquilas para passear com os cuidados de qualquer cidade grande: não deixe objetos de valor à vista e use táxis por aplicativo ou de empresa."
        ),
      },
      {
        pregunta: t("¿Qué comer en Lima?", "What should I eat in Lima?", "O que comer em Lima?"),
        respuesta: t(
          "El ceviche (mejor al mediodía, como se toma aquí), la causa limeña, el lomo saltado, los anticuchos y la cocina nikkei, que mezcla la tradición japonesa con la peruana. Para acompañar, un pisco sour o una chicha morada.",
          "Ceviche (best at lunchtime, as locals have it), causa limeña, lomo saltado, anticuchos and Nikkei cuisine, which blends Japanese and Peruvian traditions. To drink, a pisco sour or a chicha morada.",
          "O ceviche (melhor no almoço, como se come aqui), a causa limeña, o lomo saltado, os anticuchos e a cozinha nikkei, que mistura a tradição japonesa com a peruana. Para acompanhar, um pisco sour ou uma chicha morada."
        ),
      },
      {
        pregunta: t("¿Se puede ir a Paracas o Huacachina desde Lima?", "Can I visit Paracas or Huacachina from Lima?", "Dá para ir a Paracas ou Huacachina saindo de Lima?"),
        respuesta: t(
          "Sí. Paracas está a unas tres horas y media por carretera y Huacachina, junto a Ica, algo más lejos. Lo más cómodo es un tour de dos días que combina las islas Ballestas, el desierto de Huacachina y, si quieres, las Líneas de Nazca.",
          "Yes. Paracas is about three and a half hours away by road and Huacachina, next to Ica, a little further. The easiest option is a two-day tour combining the Ballestas Islands, the Huacachina desert and, if you like, the Nazca Lines.",
          "Sim. Paracas fica a cerca de três horas e meia de estrada e Huacachina, perto de Ica, um pouco mais longe. O mais prático é um tour de dois dias que combina as ilhas Ballestas, o deserto de Huacachina e, se quiser, as Linhas de Nazca."
        ),
      },
    ],
  },

  puno: {
    cerca: ["cusco", "arequipa", "colca"],
    intro: [
      t(
        "Puno se asoma al lago Titicaca, a unos 3800 metros de altura: el lago navegable más alto del mundo, compartido con Bolivia y tan grande que parece un mar. En sus aguas viven comunidades que mantienen formas de vida antiguas, desde las islas flotantes de los Uros hasta los tejedores de Taquile.",
        "Puno sits on the shore of Lake Titicaca, at around 3,800 metres: the highest navigable lake in the world, shared with Bolivia and so large it looks like a sea. Its waters are home to communities that keep age-old ways of life, from the floating islands of the Uros to the weavers of Taquile.",
        "Puno fica à beira do lago Titicaca, a cerca de 3.800 metros de altitude: o lago navegável mais alto do mundo, dividido com a Bolívia e tão grande que parece um mar. Em suas águas vivem comunidades que mantêm modos de vida antigos, das ilhas flutuantes dos Uros aos tecelões de Taquile."
      ),
      t(
        "La ciudad es la capital folclórica del Perú: en febrero celebra la fiesta de la Virgen de la Candelaria, Patrimonio Cultural Inmaterial de la Humanidad, con miles de danzantes y músicos. Está más alta que Cusco, así que conviene llegar aclimatado y tomarse el primer día con calma.",
        "The city is Peru's folklore capital: every February it celebrates the feast of the Virgen de la Candelaria, part of UNESCO's Intangible Cultural Heritage, with thousands of dancers and musicians. It is higher than Cusco, so arrive acclimatised and take the first day easy.",
        "A cidade é a capital do folclore peruano: em fevereiro celebra a festa da Virgen de la Candelaria, Patrimônio Cultural Imaterial da Humanidade, com milhares de dançarinos e músicos. Fica mais alta que Cusco, então convém chegar aclimatado e ir com calma no primeiro dia."
      ),
    ],
    queVer: [
      {
        nombre: t("Islas flotantes de los Uros", "The Uros floating islands", "Ilhas flutuantes dos Uros"),
        texto: t(
          "Islas hechas a mano con capas de totora, la caña del lago, donde las familias uros reciben a los visitantes y cuentan cómo las construyen y las renuevan.",
          "Hand-built islands made of layers of totora, the lake reed, where Uros families welcome visitors and explain how they build and renew them.",
          "Ilhas feitas à mão com camadas de totora, o junco do lago, onde as famílias uros recebem os visitantes e contam como as constroem e renovam."
        ),
        tour: "lago-titicaca",
      },
      {
        nombre: t("Isla Taquile", "Taquile Island", "Ilha Taquile"),
        texto: t(
          "Famosa por su arte textil, reconocido por la UNESCO: aquí tejen los hombres, y sus gorros dicen quién está soltero y quién casado. Caminos de piedra y vistas enormes del lago.",
          "Famous for its textile art, recognised by UNESCO: here the men knit, and their hats show who is single and who is married. Stone paths and vast views over the lake.",
          "Famosa por sua arte têxtil, reconhecida pela UNESCO: aqui quem tece são os homens, e seus gorros mostram quem é solteiro e quem é casado. Caminhos de pedra e vistas enormes do lago."
        ),
        tour: "titicaca-taquile",
      },
      {
        nombre: t("Isla Amantaní", "Amantaní Island", "Ilha Amantaní"),
        texto: t(
          "La isla para dormir en casa de una familia, compartir su comida y subir al atardecer a los templos de Pachatata y Pachamama.",
          "The island to spend a night with a local family, share their meals and climb at sunset to the temples of Pachatata and Pachamama.",
          "A ilha para dormir na casa de uma família, compartilhar sua comida e subir ao entardecer aos templos de Pachatata e Pachamama."
        ),
        tour: "titicaca-2d",
      },
      {
        nombre: t("Sillustani", "Sillustani", "Sillustani"),
        texto: t(
          "Torres funerarias de piedra —las chullpas— de las culturas colla e inca, junto a la laguna Umayo, a menos de una hora de Puno.",
          "Stone funerary towers —the chullpas— built by the Colla and Inca cultures beside Lake Umayo, less than an hour from Puno.",
          "Torres funerárias de pedra —as chullpas— das culturas colla e inca, junto à lagoa Umayo, a menos de uma hora de Puno."
        ),
        tour: "sillustani",
      },
      {
        nombre: t("Isla Suasi", "Suasi Island", "Ilha Suasi"),
        texto: t(
          "Una isla pequeña y tranquila en el norte del lago, ideal para descansar un par de días frente al agua, lejos de las rutas más concurridas.",
          "A small, peaceful island in the north of the lake, ideal for resting a couple of days by the water, away from the busiest routes.",
          "Uma ilha pequena e tranquila no norte do lago, ideal para descansar alguns dias de frente para a água, longe das rotas mais movimentadas."
        ),
        tour: "isla-suasi",
      },
      {
        nombre: t("Lodges a orillas del lago", "Lakeside lodges", "Lodges à beira do lago"),
        texto: t(
          "Para quien prefiere dormir junto al Titicaca con comodidad: atardeceres sobre el agua y salidas en bote a las islas por la mañana.",
          "For those who prefer to sleep beside Titicaca in comfort: sunsets over the water and boat trips to the islands in the morning.",
          "Para quem prefere dormir junto ao Titicaca com conforto: pores do sol sobre a água e passeios de barco às ilhas pela manhã."
        ),
        tour: "titicaca-lodge",
      },
    ],
    cuandoIr: [
      t(
        "La temporada seca, de mayo a octubre, trae cielos azules y el lago en su mejor color, pero las noches son muy frías y en junio y julio bajan de cero.",
        "The dry season, from May to October, brings blue skies and the lake at its most beautiful, but nights are very cold and drop below freezing in June and July.",
        "A estação seca, de maio a outubro, traz céu azul e o lago com sua melhor cor, mas as noites são muito frias e em junho e julho ficam abaixo de zero."
      ),
      t(
        "De diciembre a marzo llueve por las tardes y el paisaje está más verde. Febrero es el mes de la Candelaria: la ciudad está en fiesta y conviene reservar con mucha antelación.",
        "From December to March it rains in the afternoons and the landscape turns greener. February is Candelaria month: the city is in full celebration and it is best to book well ahead.",
        "De dezembro a março chove à tarde e a paisagem fica mais verde. Fevereiro é o mês da Candelaria: a cidade está em festa e convém reservar com bastante antecedência."
      ),
    ],
    comoLlegar: [
      t(
        "El aeropuerto más cercano está en Juliaca, a alrededor de una hora de Puno por carretera, con vuelos desde Lima y Cusco.",
        "The nearest airport is in Juliaca, about an hour from Puno by road, with flights from Lima and Cusco.",
        "O aeroporto mais próximo fica em Juliaca, a cerca de uma hora de Puno por estrada, com voos de Lima e Cusco."
      ),
      t(
        "Desde Cusco hay buses turísticos que hacen el viaje de día con paradas en Raqchi y el abra de La Raya (unas diez horas), buses directos más rápidos y un tren turístico. Desde Arequipa el bus tarda unas seis horas.",
        "From Cusco there are tourist buses that travel by day with stops at Raqchi and the La Raya pass (around ten hours), faster direct buses and a tourist train. From Arequipa the bus takes about six hours.",
        "De Cusco há ônibus turísticos que fazem a viagem de dia com paradas em Raqchi e no passo de La Raya (cerca de dez horas), ônibus diretos mais rápidos e um trem turístico. De Arequipa o ônibus leva umas seis horas."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuántos días hacen falta para el Titicaca?", "How many days do I need for Lake Titicaca?", "Quantos dias são necessários para o Titicaca?"),
        respuesta: t(
          "Lo ideal son dos: un día para los Uros y Taquile, y una noche en Amantaní o en un lodge del lago. En un solo día se ven los Uros y Taquile, pero con prisas.",
          "Ideally two: one day for the Uros and Taquile, and a night on Amantaní or at a lakeside lodge. In a single day you can see the Uros and Taquile, but it is rushed.",
          "O ideal são dois: um dia para os Uros e Taquile, e uma noite em Amantaní ou num lodge do lago. Em um só dia dá para ver os Uros e Taquile, mas com pressa."
        ),
      },
      {
        pregunta: t("¿Afecta la altura en Puno?", "Will the altitude affect me in Puno?", "A altitude afeta em Puno?"),
        respuesta: t(
          "Sí, más que en Cusco: la ciudad está a unos 3800 metros. Si vienes de Cusco ya estarás medio aclimatado; si llegas desde Lima o la costa, descansa el primer día, bebe agua y come ligero.",
          "Yes, more than in Cusco: the city lies at about 3,800 metres. Coming from Cusco you will be partly acclimatised; arriving from Lima or the coast, rest on the first day, drink water and eat light.",
          "Sim, mais que em Cusco: a cidade fica a cerca de 3.800 metros. Se vier de Cusco já estará meio aclimatado; se chegar de Lima ou da costa, descanse no primeiro dia, beba água e coma leve."
        ),
      },
      {
        pregunta: t("¿Vale la pena dormir en una isla?", "Is it worth spending a night on an island?", "Vale a pena dormir numa ilha?"),
        respuesta: t(
          "Para muchos viajeros es lo mejor del viaje. En Amantaní se duerme en casa de una familia, con habitaciones sencillas y comida casera: una forma de conocer la vida del lago que no da una visita de pocas horas.",
          "For many travellers it is the highlight of the trip. On Amantaní you stay with a family, in simple rooms with home cooking: a way of getting to know life on the lake that a few-hour visit cannot give.",
          "Para muitos viajantes é o melhor da viagem. Em Amantaní se dorme na casa de uma família, com quartos simples e comida caseira: uma forma de conhecer a vida do lago que uma visita de poucas horas não dá."
        ),
      },
      {
        pregunta: t("¿Las islas de los Uros son de verdad?", "Are the Uros islands real?", "As ilhas dos Uros são de verdade?"),
        respuesta: t(
          "Sí. Están hechas de totora y hay familias que viven en ellas, aunque hoy el turismo es una parte importante de su economía. La visita explica cómo se construyen y se mantienen a flote.",
          "Yes. They are made of totora reed and families do live on them, although tourism is now an important part of their economy. The visit explains how they are built and kept afloat.",
          "Sim. São feitas de totora e há famílias que vivem nelas, embora hoje o turismo seja parte importante de sua economia. A visita explica como são construídas e mantidas flutuando."
        ),
      },
    ],
  },

  colca: {
    cerca: ["arequipa", "puno"],
    clima: "arequipa",
    intro: [
      t(
        "El Cañón del Colca, a unas tres o cuatro horas de Arequipa, es uno de los cañones más profundos del mundo: en algunos tramos supera los 3000 metros, casi el doble que el Gran Cañón del Colorado. Sus laderas están cubiertas de andenes de cultivo anteriores a los incas que todavía se trabajan.",
        "The Colca Canyon, three to four hours from Arequipa, is one of the deepest canyons in the world: in places it is over 3,000 metres deep, almost twice the Grand Canyon. Its slopes are lined with pre-Inca farming terraces that are still worked today.",
        "O Cânion do Colca, a três ou quatro horas de Arequipa, é um dos cânions mais profundos do mundo: em alguns trechos passa dos 3.000 metros, quase o dobro do Grand Canyon. Suas encostas são cobertas de terraços de cultivo anteriores aos incas que ainda são trabalhados."
      ),
      t(
        "Es, además, el mejor lugar del Perú para ver al cóndor andino en vuelo. Por el valle hay pueblos con iglesias coloniales, baños termales y comunidades que conservan su vestimenta y sus danzas, como el wititi, Patrimonio Cultural Inmaterial de la Humanidad.",
        "It is also the best place in Peru to see the Andean condor in flight. The valley has villages with colonial churches, hot springs and communities that keep their traditional dress and dances, such as the wititi, part of UNESCO's Intangible Cultural Heritage.",
        "É, além disso, o melhor lugar do Peru para ver o condor andino em voo. Pelo vale há povoados com igrejas coloniais, termas e comunidades que mantêm suas roupas e danças, como o wititi, Patrimônio Cultural Imaterial da Humanidade."
      ),
    ],
    queVer: [
      {
        nombre: t("Cruz del Cóndor", "Cruz del Cóndor", "Cruz del Cóndor"),
        texto: t(
          "El mirador más famoso del cañón. A primera hora de la mañana los cóndores aprovechan las corrientes de aire caliente y pasan planeando muy cerca.",
          "The canyon's most famous viewpoint. Early in the morning the condors ride the rising warm air and glide past very close.",
          "O mirante mais famoso do cânion. Logo cedo os condores aproveitam as correntes de ar quente e passam planando bem perto."
        ),
        tour: "cruz-del-condor",
      },
      {
        nombre: t("Chivay y sus baños termales", "Chivay and its hot springs", "Chivay e suas termas"),
        texto: t(
          "La capital del valle y la base de la mayoría de tours. Sus aguas termales, a orillas del río, son el mejor final para un día de carretera y altura.",
          "The valley's main town and the base for most tours. Its riverside hot springs are the perfect end to a day of driving and altitude.",
          "A capital do vale e a base da maioria dos tours. Suas águas termais, à beira do rio, são o melhor final para um dia de estrada e altitude."
        ),
        tour: "colca-canyon",
      },
      {
        nombre: t("Yanque y Maca", "Yanque and Maca", "Yanque e Maca"),
        texto: t(
          "Pueblos con iglesias coloniales de piedra, plazas donde las mujeres visten sus bordados y miradores sobre los andenes del valle.",
          "Villages with colonial stone churches, squares where women wear their embroidered dress and viewpoints over the valley terraces.",
          "Povoados com igrejas coloniais de pedra, praças onde as mulheres usam seus bordados e mirantes sobre os terraços do vale."
        ),
        tour: "colca-canyon",
      },
      {
        nombre: t("Mirador de los Volcanes", "Volcanoes Viewpoint", "Mirante dos Vulcões"),
        texto: t(
          "El punto más alto del camino desde Arequipa, a unos 4900 metros, con apachetas de piedra y vistas a una cadena de volcanes nevados.",
          "The highest point on the road from Arequipa, at around 4,900 metres, with stone cairns and views over a chain of snow-capped volcanoes.",
          "O ponto mais alto do caminho desde Arequipa, a cerca de 4.900 metros, com apachetas de pedra e vistas para uma cadeia de vulcões nevados."
        ),
      },
      {
        nombre: t("Reserva Salinas y Aguada Blanca", "Salinas y Aguada Blanca Reserve", "Reserva Salinas y Aguada Blanca"),
        texto: t(
          "Pampas de altura en el camino donde pastan vicuñas, llamas y alpacas, y humedales con aves andinas.",
          "High plains along the way where vicuñas, llamas and alpacas graze, and wetlands full of Andean birds.",
          "Pampas de altitude no caminho onde pastam vicunhas, lhamas e alpacas, e áreas úmidas com aves andinas."
        ),
      },
      {
        nombre: t("Cabanaconde y el oasis de Sangalle", "Cabanaconde and the Sangalle oasis", "Cabanaconde e o oásis de Sangalle"),
        texto: t(
          "El pueblo desde el que bajan los trekkings al fondo del cañón, hasta un oasis con piscinas y palmeras entre paredes de roca.",
          "The village where treks descend to the bottom of the canyon, down to an oasis with pools and palm trees between rock walls.",
          "O povoado de onde descem as trilhas até o fundo do cânion, até um oásis com piscinas e palmeiras entre paredões de rocha."
        ),
        tour: "colca-3d",
      },
    ],
    cuandoIr: [
      t(
        "De abril a noviembre, la temporada seca, los días son despejados y es la mejor época para caminar. Los cóndores se ven todo el año, pero con buen tiempo hay más probabilidades.",
        "From April to November, the dry season, the days are clear and it is the best time for hiking. Condors can be seen all year round, but your chances are better in good weather.",
        "De abril a novembro, a estação seca, os dias são limpos e é a melhor época para caminhar. Os condores aparecem o ano todo, mas com tempo bom as chances são maiores."
      ),
      t(
        "De enero a marzo llueve en la sierra: el valle está muy verde, pero la carretera es más lenta y alguna excursión puede cambiar. Las noches son frías todo el año, sobre todo en junio y julio.",
        "From January to March it rains in the highlands: the valley is very green, but the road is slower and some excursions may change. Nights are cold all year, especially in June and July.",
        "De janeiro a março chove na serra: o vale fica muito verde, mas a estrada fica mais lenta e algum passeio pode mudar. As noites são frias o ano todo, sobretudo em junho e julho."
      ),
    ],
    comoLlegar: [
      t(
        "Desde Arequipa se llega por carretera hasta Chivay en unas tres o cuatro horas, cruzando la reserva de Salinas y Aguada Blanca y el mirador de los Volcanes.",
        "From Arequipa the road reaches Chivay in three to four hours, crossing the Salinas y Aguada Blanca reserve and the Volcanoes Viewpoint.",
        "De Arequipa se chega por estrada a Chivay em três ou quatro horas, cruzando a reserva de Salinas y Aguada Blanca e o mirante dos Vulcões."
      ),
      t(
        "Lo habitual es un tour de uno, dos o tres días desde Arequipa. También hay buses que siguen desde el valle hacia Puno, para quien continúa el viaje hacia el lago Titicaca.",
        "Most people take a one, two or three-day tour from Arequipa. There are also buses that continue from the valley to Puno, for those travelling on to Lake Titicaca.",
        "O mais comum é um tour de um, dois ou três dias saindo de Arequipa. Também há ônibus que seguem do vale para Puno, para quem continua a viagem até o lago Titicaca."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿A qué hora se ven los cóndores?", "What time can you see the condors?", "Em que horário se veem os condores?"),
        respuesta: t(
          "Sobre todo entre las ocho y las diez de la mañana, cuando el sol calienta el cañón y los cóndores salen a planear. Por eso los tours salen de madrugada o duermen la noche anterior en el valle.",
          "Mainly between eight and ten in the morning, when the sun warms the canyon and the condors come out to glide. That is why tours leave before dawn or spend the previous night in the valley.",
          "Sobretudo entre oito e dez da manhã, quando o sol aquece o cânion e os condores saem para planar. Por isso os tours saem de madrugada ou dormem a noite anterior no vale."
        ),
      },
      {
        pregunta: t("¿Es mejor ir en uno, dos o tres días?", "Is it better to go for one, two or three days?", "É melhor ir em um, dois ou três dias?"),
        respuesta: t(
          "En un día se ve la Cruz del Cóndor, pero se pasan muchas horas en el bus. Con dos hay tiempo para los pueblos y los baños termales. Con tres se puede bajar a pie al fondo del cañón.",
          "In one day you see Cruz del Cóndor, but spend many hours on the bus. With two there is time for the villages and the hot springs. With three you can hike down to the bottom of the canyon.",
          "Em um dia se vê a Cruz del Cóndor, mas passam-se muitas horas no ônibus. Com dois dá tempo para os povoados e as termas. Com três é possível descer a pé até o fundo do cânion."
        ),
      },
      {
        pregunta: t("¿Afecta la altura en el Colca?", "Does the altitude affect you in the Colca?", "A altitude afeta no Colca?"),
        respuesta: t(
          "El valle está entre 3200 y 3600 metros, y el camino desde Arequipa sube hasta unos 4900. Conviene ir hidratado, comer ligero y llevar abrigo: arriba hace frío incluso con sol.",
          "The valley lies between 3,200 and 3,600 metres, and the road from Arequipa climbs to about 4,900. Stay hydrated, eat light and bring warm clothes: it is cold up there even in sunshine.",
          "O vale fica entre 3.200 e 3.600 metros, e o caminho desde Arequipa sobe até uns 4.900. Vá hidratado, coma leve e leve agasalho: lá em cima faz frio mesmo com sol."
        ),
      },
      {
        pregunta: t("¿Qué llevar al Colca?", "What should I pack for the Colca?", "O que levar ao Colca?"),
        respuesta: t(
          "Ropa de abrigo por capas, protector solar, gafas de sol y sombrero, traje de baño para las termas y algo de efectivo para el boleto turístico del valle y las compras en los pueblos.",
          "Warm layers, sunscreen, sunglasses and a hat, a swimsuit for the hot springs and some cash for the valley's tourist ticket and shopping in the villages.",
          "Roupas em camadas, protetor solar, óculos de sol e chapéu, roupa de banho para as termas e algum dinheiro em espécie para o bilhete turístico do vale e as compras nos povoados."
        ),
      },
    ],
  },

  nazca: {
    cerca: ["lima", "arequipa"],
    intro: [
      t(
        "En el desierto de Nazca, en la costa sur del Perú, hay cientos de figuras y líneas trazadas sobre el suelo hace unos dos mil años: un colibrí, un mono, una araña, un cóndor y largas líneas rectas que recorren kilómetros. Son tan grandes que solo se aprecian bien desde el aire, y son Patrimonio de la Humanidad desde 1994.",
        "In the Nazca desert, on Peru's southern coast, hundreds of figures and lines were drawn on the ground some two thousand years ago: a hummingbird, a monkey, a spider, a condor and long straight lines that run for kilometres. They are so large they can only be properly seen from the air, and have been a World Heritage Site since 1994.",
        "No deserto de Nazca, na costa sul do Peru, há centenas de figuras e linhas traçadas no chão há cerca de dois mil anos: um beija-flor, um macaco, uma aranha, um condor e longas linhas retas que percorrem quilômetros. São tão grandes que só se apreciam bem do alto, e são Patrimônio da Humanidade desde 1994."
      ),
      t(
        "Las trazó la cultura nasca, y todavía se discute para qué servían. La región se suele combinar con Paracas e Ica: las islas Ballestas, el desierto que llega al mar y el oasis de Huacachina, rodeado de dunas.",
        "They were made by the Nasca culture, and their purpose is still debated. The area is usually combined with Paracas and Ica: the Ballestas Islands, the desert meeting the sea and the Huacachina oasis, ringed by dunes.",
        "Foram traçadas pela cultura nasca, e ainda se discute para que serviam. A região costuma ser combinada com Paracas e Ica: as ilhas Ballestas, o deserto que chega ao mar e o oásis de Huacachina, cercado de dunas."
      ),
    ],
    queVer: [
      {
        nombre: t("Sobrevuelo de las Líneas", "Flight over the Lines", "Sobrevoo das Linhas"),
        texto: t(
          "Avionetas que en unos treinta minutos pasan sobre las figuras principales. Es la única forma de verlas completas.",
          "Light aircraft that fly over the main figures in about thirty minutes. It is the only way to see them in full.",
          "Aviões pequenos que em cerca de trinta minutos passam sobre as figuras principais. É a única forma de vê-las inteiras."
        ),
        tour: "nazca-lines",
      },
      {
        nombre: t("Mirador de la Panamericana", "Pan-American Highway viewing tower", "Mirante da Pan-Americana"),
        texto: t(
          "Una torre junto a la carretera desde la que se ven de cerca dos figuras, el árbol y las manos: una alternativa para quien prefiere no volar.",
          "A tower beside the road from which two figures, the tree and the hands, can be seen up close: an option for those who would rather not fly.",
          "Uma torre junto à estrada de onde se veem de perto duas figuras, a árvore e as mãos: uma alternativa para quem prefere não voar."
        ),
      },
      {
        nombre: t("Acueductos de Cantalloc", "Cantalloc Aqueducts", "Aquedutos de Cantalloc"),
        texto: t(
          "Canales subterráneos con bocas en espiral que los nasca construyeron para llevar agua al desierto, y que todavía funcionan.",
          "Underground channels with spiral openings that the Nasca built to bring water to the desert, and which still work today.",
          "Canais subterrâneos com bocas em espiral que os nascas construíram para levar água ao deserto, e que ainda funcionam."
        ),
      },
      {
        nombre: t("Cementerio de Chauchilla", "Chauchilla Cemetery", "Cemitério de Chauchilla"),
        texto: t(
          "Tumbas de la época nasca abiertas en pleno desierto, con momias, restos de tejidos y cerámica conservados por el clima seco.",
          "Nasca-era tombs open in the middle of the desert, with mummies, textile remains and pottery preserved by the dry climate.",
          "Túmulos da época nasca abertos em pleno deserto, com múmias, restos de tecidos e cerâmica conservados pelo clima seco."
        ),
      },
      {
        nombre: t("Huacachina", "Huacachina", "Huacachina"),
        texto: t(
          "Un oasis rodeado de dunas gigantes junto a Ica, para recorrer el desierto en buggy y deslizarse en sandboard al atardecer.",
          "An oasis surrounded by giant dunes near Ica, for dune-buggy rides across the desert and sandboarding at sunset.",
          "Um oásis cercado de dunas gigantes perto de Ica, para percorrer o deserto de buggy e descer de sandboard ao pôr do sol."
        ),
        tour: "paracas-huacachina",
      },
      {
        nombre: t("Paracas e islas Ballestas", "Paracas and the Ballestas Islands", "Paracas e ilhas Ballestas"),
        texto: t(
          "En barco hasta unas islas llenas de lobos marinos, pingüinos de Humboldt y miles de aves, y después la reserva de Paracas, donde el desierto llega al mar.",
          "A boat trip to islands teeming with sea lions, Humboldt penguins and thousands of birds, followed by the Paracas reserve, where the desert meets the sea.",
          "De barco até ilhas cheias de leões-marinhos, pinguins-de-humboldt e milhares de aves, e depois a reserva de Paracas, onde o deserto encontra o mar."
        ),
        tour: "paracas-huacachina",
      },
    ],
    cuandoIr: [
      t(
        "Nazca es desierto: casi nunca llueve y se puede visitar todo el año. De diciembre a marzo hace más calor, con días de más de 30 grados.",
        "Nazca is desert: it hardly ever rains and it can be visited all year round. December to March is hotter, with days above 30 °C.",
        "Nazca é deserto: quase nunca chove e pode ser visitada o ano todo. De dezembro a março faz mais calor, com dias acima de 30 graus."
      ),
      t(
        "Los sobrevuelos salen por la mañana, cuando el aire está más tranquilo y la visibilidad es mejor. Con viento o neblina pueden retrasarse, así que conviene no programarlos justo antes de otro traslado.",
        "Flights leave in the morning, when the air is calmer and visibility is better. Wind or haze can delay them, so avoid scheduling one right before another transfer.",
        "Os sobrevoos saem de manhã, quando o ar está mais calmo e a visibilidade é melhor. Com vento ou névoa podem atrasar, então evite marcá-los logo antes de outro traslado."
      ),
    ],
    comoLlegar: [
      t(
        "Desde Lima se viaja por la Panamericana Sur: unas siete horas en bus hasta Nazca, o en etapas parando antes en Paracas e Ica, que es lo habitual en un tour de dos días.",
        "From Lima you travel along the Pan-American Highway South: about seven hours by bus to Nazca, or in stages with stops in Paracas and Ica, which is how a two-day tour usually works.",
        "De Lima se viaja pela Pan-Americana Sul: cerca de sete horas de ônibus até Nazca, ou em etapas parando antes em Paracas e Ica, que é o habitual num tour de dois dias."
      ),
      t(
        "Desde Arequipa también hay buses, de día o de noche. Los sobrevuelos salen del aeródromo de Nazca, y algunos operadores ofrecen también vuelos desde Pisco o Ica.",
        "There are also buses from Arequipa, by day or overnight. Flights leave from Nazca's airfield, and some operators also fly from Pisco or Ica.",
        "De Arequipa também há ônibus, de dia ou à noite. Os sobrevoos saem do aeródromo de Nazca, e alguns operadores também oferecem voos a partir de Pisco ou Ica."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Hay que hacer el sobrevuelo para ver las líneas?", "Do I need to take a flight to see the lines?", "É preciso fazer o sobrevoo para ver as linhas?"),
        respuesta: t(
          "Para verlas enteras, sí. Desde el mirador de la carretera se ven dos figuras de cerca, pero el colibrí, el mono o la araña solo se aprecian desde el aire.",
          "To see them in full, yes. From the roadside tower you can see two figures up close, but the hummingbird, the monkey or the spider can only be appreciated from the air.",
          "Para vê-las inteiras, sim. Do mirante da estrada se veem duas figuras de perto, mas o beija-flor, o macaco ou a aranha só se apreciam do alto."
        ),
      },
      {
        pregunta: t("¿El sobrevuelo marea?", "Does the flight cause motion sickness?", "O sobrevoo dá enjoo?"),
        respuesta: t(
          "Puede. Las avionetas son pequeñas y giran a un lado y a otro para que todos vean las figuras. Desayuna ligero, toma una pastilla contra el mareo si sueles marearte y mira al horizonte entre figura y figura.",
          "It can. The planes are small and bank from side to side so everyone can see the figures. Have a light breakfast, take a motion-sickness tablet if you are prone to it and look at the horizon between figures.",
          "Pode dar. Os aviões são pequenos e inclinam de um lado para o outro para que todos vejam as figuras. Tome um café da manhã leve, use um remédio contra enjoo se costuma enjoar e olhe para o horizonte entre uma figura e outra."
        ),
      },
      {
        pregunta: t("¿Cuánto tiempo hace falta?", "How much time do I need?", "Quanto tempo é necessário?"),
        respuesta: t(
          "Con dos días desde Lima se combinan Paracas, Huacachina y el sobrevuelo. Si solo quieres ver las líneas, se puede hacer en un día largo saliendo de Ica o de Paracas.",
          "Two days from Lima combine Paracas, Huacachina and the flight. If you only want the lines, it can be done in a long day from Ica or Paracas.",
          "Com dois dias saindo de Lima se combinam Paracas, Huacachina e o sobrevoo. Se só quiser ver as linhas, dá para fazer num dia longo saindo de Ica ou de Paracas."
        ),
      },
      {
        pregunta: t("¿Quién hizo las Líneas de Nazca?", "Who made the Nazca Lines?", "Quem fez as Linhas de Nazca?"),
        respuesta: t(
          "La cultura nasca, que vivió en esta costa hace unos dos mil años. Retiraron las piedras oscuras de la superficie para dejar a la vista el suelo claro, y el clima seco las ha conservado. La investigadora María Reiche dedicó su vida a estudiarlas y protegerlas.",
          "The Nasca culture, which lived on this coast some two thousand years ago. They removed the dark surface stones to reveal the lighter ground beneath, and the dry climate has preserved them. The researcher Maria Reiche devoted her life to studying and protecting them.",
          "A cultura nasca, que viveu nesta costa há cerca de dois mil anos. Retiraram as pedras escuras da superfície para deixar à vista o solo claro, e o clima seco as conservou. A pesquisadora Maria Reiche dedicou a vida a estudá-las e protegê-las."
        ),
      },
    ],
  },


  amazonia: {
    cerca: ["manu", "puerto-maldonado", "iquitos"],
    intro: [
      t(
        "Más de la mitad del Perú es selva amazónica, uno de los lugares con más especies del planeta: guacamayos, monos, nutrias gigantes, delfines rosados y miles de plantas, en bosques que se recorren a pie, en canoa o desde torres por encima de los árboles.",
        "More than half of Peru is Amazon rainforest, one of the most species-rich places on the planet: macaws, monkeys, giant otters, pink river dolphins and thousands of plants, in forests explored on foot, by canoe or from towers above the treetops.",
        "Mais da metade do Peru é floresta amazônica, um dos lugares com mais espécies do planeta: araras, macacos, ariranhas, botos-cor-de-rosa e milhares de plantas, em florestas percorridas a pé, de canoa ou de torres acima das árvores."
      ),
      t(
        "Hay tres puertas de entrada, y cada una es un viaje distinto: Puerto Maldonado y Tambopata, la más fácil, a un vuelo corto de Cusco; el Manu, al que se baja por carretera desde los Andes; e Iquitos, a orillas del río Amazonas, adonde solo se llega en avión o por río. En las tres se duerme en lodges en plena selva.",
        "There are three gateways, and each is a different trip: Puerto Maldonado and Tambopata, the easiest, a short flight from Cusco; Manu, reached by road down from the Andes; and Iquitos, on the Amazon River, accessible only by air or by boat. In all three you stay in lodges deep in the forest.",
        "Há três portas de entrada, e cada uma é uma viagem diferente: Puerto Maldonado e Tambopata, a mais fácil, a um voo curto de Cusco; o Manu, ao qual se desce por estrada desde os Andes; e Iquitos, às margens do rio Amazonas, aonde só se chega de avião ou pelo rio. Nas três se dorme em lodges em plena selva."
      ),
    ],
    queVer: [
      {
        nombre: t("Reserva Nacional Tambopata", "Tambopata National Reserve", "Reserva Nacional Tambopata"),
        texto: t(
          "Lagos con nutrias gigantes, collpas de guacamayos y caminatas nocturnas, a pocas horas en bote desde Puerto Maldonado.",
          "Lakes with giant otters, macaw clay licks and night walks, a few hours by boat from Puerto Maldonado.",
          "Lagos com ariranhas, barreiros de araras e caminhadas noturnas, a poucas horas de barco de Puerto Maldonado."
        ),
        tour: "tambopata",
      },
      {
        nombre: t("Parque Nacional del Manu", "Manu National Park", "Parque Nacional do Manu"),
        texto: t(
          "Del bosque de nubes a la selva baja en un solo viaje: gallitos de las rocas, monos y una de las mayores biodiversidades del mundo.",
          "From cloud forest to lowland jungle in a single trip: cock-of-the-rock, monkeys and one of the greatest concentrations of wildlife on Earth.",
          "Da floresta de nuvens à selva baixa numa só viagem: galos-da-serra, macacos e uma das maiores biodiversidades do mundo."
        ),
        tour: "manu-jungle",
      },
      {
        nombre: t("Collpas de guacamayos", "Macaw clay licks", "Barreiros de araras"),
        texto: t(
          "Paredes de arcilla a las que acuden al amanecer cientos de loros y guacamayos de colores: uno de los espectáculos más fotografiados de la selva.",
          "Clay banks where hundreds of colourful parrots and macaws gather at dawn: one of the most photographed sights in the rainforest.",
          "Paredões de argila aos quais centenas de papagaios e araras coloridos chegam ao amanhecer: um dos espetáculos mais fotografados da selva."
        ),
        tour: "manu-guacamayos",
      },
      {
        nombre: t("Iquitos y el río Amazonas", "Iquitos and the Amazon River", "Iquitos e o rio Amazonas"),
        texto: t(
          "La ciudad más grande del mundo sin carretera de acceso, punto de partida para navegar el Amazonas y ver delfines rosados.",
          "The largest city in the world with no road access, the starting point for sailing the Amazon and spotting pink river dolphins.",
          "A maior cidade do mundo sem acesso por estrada, ponto de partida para navegar o Amazonas e ver botos-cor-de-rosa."
        ),
        tour: "iquitos-amazon",
      },
      {
        nombre: t("Reserva Nacional Pacaya Samiria", "Pacaya Samiria National Reserve", "Reserva Nacional Pacaya Samiria"),
        texto: t(
          "Una de las áreas protegidas más grandes del Perú: bosques inundables entre los ríos Marañón y Ucayali que se recorren en canoa.",
          "One of Peru's largest protected areas: flooded forests between the Marañón and Ucayali rivers, explored by canoe.",
          "Uma das maiores áreas protegidas do Peru: florestas alagáveis entre os rios Marañón e Ucayali, percorridas de canoa."
        ),
        tour: "pacaya-samiria",
      },
      {
        nombre: t("Laguna de Quistococha", "Quistococha Lagoon", "Lagoa de Quistococha"),
        texto: t(
          "Una laguna rodeada de bosque cerca de Iquitos, para una primera toma de contacto con la selva en un solo día.",
          "A forest-fringed lagoon near Iquitos, for a first taste of the rainforest in a single day.",
          "Uma lagoa cercada de floresta perto de Iquitos, para um primeiro contato com a selva em um só dia."
        ),
        tour: "quistococha",
      },
    ],
    cuandoIr: [
      t(
        "En la selva llueve todo el año, pero de mayo a octubre llueve menos: los senderos están más secos y es la época favorita para Tambopata y el Manu. Entre junio y agosto pueden llegar los «friajes», unos días de frío inesperado.",
        "It rains all year in the rainforest, but less from May to October: trails are drier and it is the favourite season for Tambopata and Manu. Between June and August cold fronts called friajes can bring a few unexpectedly chilly days.",
        "Na selva chove o ano todo, mas de maio a outubro chove menos: as trilhas estão mais secas e é a época preferida para Tambopata e o Manu. Entre junho e agosto podem chegar as «friajes», alguns dias de frio inesperado."
      ),
      t(
        "De diciembre a marzo llueve con fuerza y los ríos crecen. En Iquitos es la época de aguas altas, cuando se navega en canoa por dentro del bosque inundado; en el Manu, en cambio, la carretera puede complicarse.",
        "From December to March the rain is heavy and the rivers rise. In Iquitos it is high-water season, when canoes glide right through the flooded forest; in Manu, on the other hand, the road can become difficult.",
        "De dezembro a março chove forte e os rios sobem. Em Iquitos é a época das águas altas, quando se navega de canoa por dentro da floresta alagada; no Manu, por outro lado, a estrada pode ficar complicada."
      ),
    ],
    comoLlegar: [
      t(
        "A Puerto Maldonado hay vuelos desde Lima y desde Cusco, este último de menos de una hora. A Iquitos solo se llega en avión desde Lima o en barco por el río, un viaje de varios días.",
        "There are flights to Puerto Maldonado from Lima and from Cusco, the latter under an hour. Iquitos can only be reached by plane from Lima or by riverboat, a journey of several days.",
        "Para Puerto Maldonado há voos de Lima e de Cusco, este com menos de uma hora. A Iquitos só se chega de avião desde Lima ou de barco pelo rio, uma viagem de vários dias."
      ),
      t(
        "Al Manu se va por carretera desde Cusco: un día entero que cruza los Andes y baja por el bosque de nubes, y después se sigue en bote. En todos los casos, el tour incluye los traslados hasta el lodge.",
        "Manu is reached by road from Cusco: a full day crossing the Andes and descending through the cloud forest, then continuing by boat. In every case, the tour includes transfers to the lodge.",
        "Ao Manu se vai por estrada desde Cusco: um dia inteiro cruzando os Andes e descendo pela floresta de nuvens, e depois se segue de barco. Em todos os casos, o tour inclui os traslados até o lodge."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Qué parte de la selva elegir?", "Which part of the Amazon should I choose?", "Que parte da selva escolher?"),
        respuesta: t(
          "Si tienes poco tiempo y vas a Cusco, Tambopata: vuelo corto y lodges a pocas horas. Si quieres la selva más virgen y no te importa el viaje, el Manu. Si te atraen el río Amazonas y los delfines rosados, Iquitos.",
          "If you are short on time and visiting Cusco, Tambopata: a short flight and lodges a few hours away. If you want the wildest forest and do not mind the journey, Manu. If the Amazon River and pink dolphins appeal, Iquitos.",
          "Se tem pouco tempo e vai a Cusco, Tambopata: voo curto e lodges a poucas horas. Se quer a selva mais preservada e não se importa com a viagem, o Manu. Se o rio Amazonas e os botos-cor-de-rosa atraem você, Iquitos."
        ),
      },
      {
        pregunta: t("¿Cuántos días hacen falta en la selva?", "How many days do I need in the Amazon?", "Quantos dias são necessários na selva?"),
        respuesta: t(
          "Tres días y dos noches es el mínimo para que merezca la pena. En el Manu, cuatro o cinco, porque el viaje de ida y vuelta lleva su tiempo.",
          "Three days and two nights is the minimum to make it worthwhile. In Manu, four or five, as the journey there and back takes time.",
          "Três dias e duas noites é o mínimo para valer a pena. No Manu, quatro ou cinco, porque a viagem de ida e volta leva tempo."
        ),
      },
      {
        pregunta: t("¿Hace falta vacunarse para ir a la selva?", "Do I need vaccinations for the Amazon?", "É preciso se vacinar para ir à selva?"),
        respuesta: t(
          "Para la selva se suele recomendar la vacuna contra la fiebre amarilla, al menos diez días antes del viaje. Consulta a tu médico o a un centro de medicina del viajero, que te dirá también si conviene alguna otra precaución.",
          "The yellow fever vaccine is usually recommended for the rainforest, at least ten days before travelling. Ask your doctor or a travel clinic, who will also tell you whether any other precautions are advisable.",
          "Para a selva costuma-se recomendar a vacina contra a febre amarela, pelo menos dez dias antes da viagem. Consulte seu médico ou um centro de medicina do viajante, que dirá também se convém alguma outra precaução."
        ),
      },
      {
        pregunta: t("¿Qué llevar a la selva?", "What should I pack for the Amazon?", "O que levar para a selva?"),
        respuesta: t(
          "Ropa ligera de manga larga y colores claros, repelente, un impermeable, calzado que se pueda mojar, linterna, protector solar y una bolsa estanca para la cámara. Los lodges suelen prestar botas de goma.",
          "Light long-sleeved clothing in pale colours, insect repellent, a rain jacket, shoes that can get wet, a torch, sunscreen and a dry bag for your camera. Lodges usually lend rubber boots.",
          "Roupas leves de manga comprida e cores claras, repelente, uma capa de chuva, calçado que possa molhar, lanterna, protetor solar e um saco estanque para a câmera. Os lodges costumam emprestar botas de borracha."
        ),
      },
    ],
  },

  iquitos: {
    cerca: ["amazonia", "lima"],
    clima: "amazonia",
    intro: [
      t(
        "Iquitos es la ciudad más grande del mundo a la que no se puede llegar por carretera: solo en avión o navegando por el río. Está a orillas del Amazonas, en plena selva del noreste del Perú, y es el punto de partida para recorrer el río, ver delfines rosados y dormir en lodges en la selva.",
        "Iquitos is the largest city in the world that cannot be reached by road: only by plane or by river. It lies on the banks of the Amazon, deep in the rainforest of north-eastern Peru, and is the starting point for exploring the river, spotting pink dolphins and staying in jungle lodges.",
        "Iquitos é a maior cidade do mundo à qual não se chega por estrada: só de avião ou navegando pelo rio. Fica às margens do Amazonas, em plena selva do nordeste do Peru, e é o ponto de partida para percorrer o rio, ver botos-cor-de-rosa e dormir em lodges na selva."
      ),
      t(
        "La ciudad vivió su época dorada con el caucho, a finales del siglo XIX y principios del XX, y de entonces quedan casonas con azulejos traídos de Europa frente al malecón. Hoy es una ciudad animada y calurosa, con mototaxis por todas partes y un mercado, el de Belén, que no se parece a ningún otro.",
        "The city enjoyed its golden age during the rubber boom of the late 19th and early 20th centuries, which left mansions faced with European tiles along the riverfront. Today it is a lively, hot city, with motorcycle taxis everywhere and a market, Belén, unlike any other.",
        "A cidade viveu sua época de ouro com a borracha, no fim do século XIX e início do XX, e daquela época ficaram casarões com azulejos trazidos da Europa diante do calçadão. Hoje é uma cidade animada e quente, com mototáxis por toda parte e um mercado, o de Belén, que não se parece com nenhum outro."
      ),
    ],
    queVer: [
      {
        nombre: t("Malecón y casonas del caucho", "Riverfront and rubber-boom mansions", "Calçadão e casarões da borracha"),
        texto: t(
          "El paseo junto al río, con casonas de azulejos de la época del caucho y la Casa de Fierro, una casa de hierro prefabricada traída de Europa.",
          "The riverside promenade, with tiled mansions from the rubber era and the Casa de Fierro, a prefabricated iron house shipped from Europe.",
          "O passeio à beira do rio, com casarões de azulejos da época da borracha e a Casa de Fierro, uma casa de ferro pré-fabricada trazida da Europa."
        ),
      },
      {
        nombre: t("Mercado y barrio de Belén", "Belén market and neighbourhood", "Mercado e bairro de Belén"),
        texto: t(
          "Un mercado enorme de productos de la selva y, a sus pies, un barrio de casas flotantes y sobre pilotes que cambia con la crecida del río.",
          "A huge market of rainforest produce and, below it, a neighbourhood of floating and stilt houses that changes as the river rises.",
          "Um mercado enorme de produtos da selva e, logo abaixo, um bairro de casas flutuantes e sobre palafitas que muda com a cheia do rio."
        ),
      },
      {
        nombre: t("Laguna de Quistococha", "Quistococha Lagoon", "Lagoa de Quistococha"),
        texto: t(
          "Una laguna rodeada de bosque a las afueras de la ciudad, con playa de arena, para una primera excursión de un día.",
          "A forest-fringed lagoon on the outskirts of the city, with a sandy beach, for a first day trip.",
          "Uma lagoa cercada de floresta nos arredores da cidade, com praia de areia, para um primeiro passeio de um dia."
        ),
        tour: "quistococha",
      },
      {
        nombre: t("Lodges en el Amazonas", "Amazon lodges", "Lodges no Amazonas"),
        texto: t(
          "Varios días en plena selva: caminatas, pesca de pirañas, salidas nocturnas y paseos en bote para ver delfines rosados.",
          "Several days deep in the forest: jungle walks, piranha fishing, night outings and boat trips to see pink dolphins.",
          "Vários dias em plena selva: caminhadas, pesca de piranhas, saídas noturnas e passeios de barco para ver botos-cor-de-rosa."
        ),
        tour: "iquitos-amazon",
      },
      {
        nombre: t("Reserva Nacional Pacaya Samiria", "Pacaya Samiria National Reserve", "Reserva Nacional Pacaya Samiria"),
        texto: t(
          "La gran reserva de bosques inundables, a varias horas de Iquitos, entre los ríos Marañón y Ucayali, que al unirse forman el Amazonas.",
          "The great flooded-forest reserve, several hours from Iquitos, between the Marañón and Ucayali rivers, which join to form the Amazon.",
          "A grande reserva de florestas alagáveis, a várias horas de Iquitos, entre os rios Marañón e Ucayali, que ao se unirem formam o Amazonas."
        ),
        tour: "pacaya-samiria",
      },
      {
        nombre: t("Centros de rescate de fauna", "Wildlife rescue centres", "Centros de resgate de fauna"),
        texto: t(
          "Lugares que cuidan manatíes, monos y otros animales rescatados del tráfico ilegal, y que se pueden visitar con guía.",
          "Centres caring for manatees, monkeys and other animals rescued from illegal trafficking, which can be visited with a guide.",
          "Lugares que cuidam de peixes-boi, macacos e outros animais resgatados do tráfico ilegal, e que podem ser visitados com guia."
        ),
      },
    ],
    cuandoIr: [
      t(
        "Hace calor y humedad todo el año, con más de 30 grados de día. De diciembre a mayo es la época de aguas altas: el río inunda el bosque y se navega en canoa entre los árboles.",
        "It is hot and humid all year, above 30 °C by day. December to May is high-water season: the river floods the forest and canoes glide between the trees.",
        "Faz calor e umidade o ano todo, com mais de 30 graus de dia. De dezembro a maio é a época das águas altas: o rio inunda a floresta e se navega de canoa entre as árvores."
      ),
      t(
        "De junio a noviembre bajan las aguas, aparecen playas en el río y se camina más por la selva. Las dos épocas tienen su encanto; la lluvia llega de golpe y se va pronto.",
        "From June to November the water drops, beaches appear along the river and there is more walking in the forest. Both seasons have their charm; the rain comes suddenly and soon passes.",
        "De junho a novembro as águas baixam, aparecem praias no rio e se caminha mais pela selva. As duas épocas têm seu encanto; a chuva chega de repente e logo passa."
      ),
    ],
    comoLlegar: [
      t(
        "En avión desde Lima, en algo menos de dos horas; también hay vuelos desde otras ciudades del Perú. Ninguna carretera une Iquitos con el resto del país.",
        "By plane from Lima, in just under two hours; there are also flights from other Peruvian cities. No road links Iquitos with the rest of the country.",
        "De avião desde Lima, em pouco menos de duas horas; também há voos de outras cidades do Peru. Nenhuma estrada liga Iquitos ao resto do país."
      ),
      t(
        "La otra forma de llegar es en barco por el río desde Yurimaguas o Pucallpa: varios días en una lancha de pasajeros, una aventura en sí misma. A los lodges se va en bote desde el puerto de la ciudad o desde Nauta.",
        "The other way in is by riverboat from Yurimaguas or Pucallpa: several days on a passenger boat, an adventure in itself. Lodges are reached by boat from the city's port or from Nauta.",
        "A outra forma de chegar é de barco pelo rio desde Yurimaguas ou Pucallpa: vários dias numa lancha de passageiros, uma aventura por si só. Aos lodges se vai de barco desde o porto da cidade ou desde Nauta."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuántos días hacen falta en Iquitos?", "How many days do I need in Iquitos?", "Quantos dias são necessários em Iquitos?"),
        respuesta: t(
          "Al menos cuatro: uno en la ciudad y tres en un lodge en la selva. Para Pacaya Samiria, que está más lejos, cuenta con cinco días.",
          "At least four: one in the city and three at a jungle lodge. For Pacaya Samiria, which is further away, allow five days.",
          "Pelo menos quatro: um na cidade e três num lodge na selva. Para Pacaya Samiria, que fica mais longe, conte com cinco dias."
        ),
      },
      {
        pregunta: t("¿Se ven delfines rosados?", "Will I see pink river dolphins?", "Dá para ver botos-cor-de-rosa?"),
        respuesta: t(
          "Sí, son bastante fáciles de ver en los ríos cercanos a Iquitos, sobre todo donde se juntan dos ríos. Los guías conocen los lugares donde suelen salir a respirar.",
          "Yes, they are fairly easy to see in the rivers around Iquitos, especially where two rivers meet. Guides know the spots where they usually surface to breathe.",
          "Sim, são bem fáceis de ver nos rios perto de Iquitos, sobretudo onde dois rios se encontram. Os guias conhecem os lugares onde costumam subir para respirar."
        ),
      },
      {
        pregunta: t("¿Es necesaria la vacuna de la fiebre amarilla?", "Is the yellow fever vaccine necessary?", "A vacina contra a febre amarela é necessária?"),
        respuesta: t(
          "Se recomienda para la selva, al menos diez días antes del viaje. Consulta con tu médico, que te dirá también si conviene tomar alguna otra precaución.",
          "It is recommended for the rainforest, at least ten days before travelling. Ask your doctor, who will also advise on any other precautions.",
          "É recomendada para a selva, pelo menos dez dias antes da viagem. Consulte seu médico, que dirá também se convém alguma outra precaução."
        ),
      },
      {
        pregunta: t("¿Qué comer en Iquitos?", "What should I eat in Iquitos?", "O que comer em Iquitos?"),
        respuesta: t(
          "El juane, arroz con gallina envuelto en hoja de bijao; el tacacho con cecina; pescados de río como el paiche, y los jugos de frutas de la selva, como el camu camu o el aguaje.",
          "Juane, rice and chicken wrapped in a bijao leaf; tacacho with cecina; river fish such as paiche, and juices from jungle fruits like camu camu or aguaje.",
          "O juane, arroz com galinha envolto em folha de bijao; o tacacho com cecina; peixes de rio como o pirarucu, e os sucos de frutas da selva, como o camu-camu ou o buriti."
        ),
      },
    ],
  },

  "puerto-maldonado": {
    cerca: ["amazonia", "manu", "cusco"],
    clima: "amazonia",
    intro: [
      t(
        "Puerto Maldonado es la capital de Madre de Dios y la entrada a la Reserva Nacional Tambopata, una de las zonas de selva más ricas en vida del Perú. Está en la unión de los ríos Tambopata y Madre de Dios, a menos de una hora de vuelo de Cusco: la selva más fácil de añadir a un viaje por los Andes.",
        "Puerto Maldonado is the capital of Madre de Dios and the gateway to the Tambopata National Reserve, one of the richest rainforest areas in Peru. It lies where the Tambopata and Madre de Dios rivers meet, less than an hour's flight from Cusco: the easiest jungle to add to a trip through the Andes.",
        "Puerto Maldonado é a capital de Madre de Dios e a entrada da Reserva Nacional Tambopata, uma das áreas de selva mais ricas em vida do Peru. Fica no encontro dos rios Tambopata e Madre de Dios, a menos de uma hora de voo de Cusco: a selva mais fácil de incluir numa viagem pelos Andes."
      ),
      t(
        "La ciudad es pequeña y se usa sobre todo como lugar de paso: desde su puerto salen los botes hacia los lodges, río arriba, donde los días se reparten entre caminatas, lagos y madrugones para ver a los guacamayos.",
        "The town is small and mostly a stopover: from its port, boats head upriver to the lodges, where days are spent between forest walks, lakes and early starts to watch the macaws.",
        "A cidade é pequena e serve sobretudo de passagem: do seu porto saem os barcos rio acima até os lodges, onde os dias se dividem entre caminhadas, lagos e madrugadas para ver as araras."
      ),
    ],
    queVer: [
      {
        nombre: t("Lago Sandoval", "Lake Sandoval", "Lago Sandoval"),
        texto: t(
          "Un lago de aguas tranquilas rodeado de palmeras de aguaje, al que se llega caminando y en canoa. Es el lugar para ver nutrias gigantes, monos y garzas.",
          "A calm lake ringed by aguaje palms, reached on foot and by canoe. It is the place to see giant otters, monkeys and herons.",
          "Um lago de águas calmas cercado de palmeiras de buriti, ao qual se chega caminhando e de canoa. É o lugar para ver ariranhas, macacos e garças."
        ),
        tour: "tambopata",
      },
      {
        nombre: t("Collpas de guacamayos", "Macaw clay licks", "Barreiros de araras"),
        texto: t(
          "Paredes de barro donde, al amanecer, cientos de guacamayos y loros bajan a comer arcilla. En Tambopata está una de las más grandes del país.",
          "Mud banks where hundreds of macaws and parrots come down at dawn to eat clay. Tambopata has one of the largest in the country.",
          "Paredões de barro onde, ao amanhecer, centenas de araras e papagaios descem para comer argila. Em Tambopata fica um dos maiores do país."
        ),
        tour: "tambopata-4d",
      },
      {
        nombre: t("Torres de dosel", "Canopy towers", "Torres de dossel"),
        texto: t(
          "Torres que suben por encima de los árboles para ver la selva desde arriba, con aves que desde el suelo no se alcanzan a ver.",
          "Towers that rise above the treetops to see the forest from above, with birds you would never spot from the ground.",
          "Torres que sobem acima das árvores para ver a selva do alto, com aves que do chão não se consegue ver."
        ),
        tour: "tambopata",
      },
      {
        nombre: t("Caminatas nocturnas", "Night walks", "Caminhadas noturnas"),
        texto: t(
          "De noche la selva cambia: ranas, insectos, tarántulas y, en la orilla del río, los ojos brillantes de los caimanes.",
          "At night the forest changes: frogs, insects, tarantulas and, on the riverbank, the glowing eyes of caimans.",
          "À noite a selva muda: rãs, insetos, tarântulas e, na margem do rio, os olhos brilhantes dos jacarés."
        ),
        tour: "tambopata-4d",
      },
      {
        nombre: t("Río Madre de Dios", "Madre de Dios River", "Rio Madre de Dios"),
        texto: t(
          "Paseos en bote al atardecer entre playas de arena y bosque, con capibaras y aves en las orillas.",
          "Boat rides at sunset between sandy beaches and forest, with capybaras and birds on the banks.",
          "Passeios de barco ao entardecer entre praias de areia e floresta, com capivaras e aves nas margens."
        ),
      },
    ],
    cuandoIr: [
      t(
        "La época seca, de abril a octubre, es la más cómoda: llueve menos, los senderos están firmes y los guacamayos son muy activos en las collpas. Entre junio y agosto llegan a veces los «friajes», días en los que la temperatura cae de golpe.",
        "The dry season, from April to October, is the most comfortable: less rain, firm trails and very active macaws at the clay licks. Between June and August cold spells called friajes sometimes make the temperature drop suddenly.",
        "A estação seca, de abril a outubro, é a mais confortável: chove menos, as trilhas estão firmes e as araras ficam muito ativas nos barreiros. Entre junho e agosto às vezes chegam as «friajes», dias em que a temperatura cai de repente."
      ),
      t(
        "De noviembre a marzo llueve mucho más, a menudo en chaparrones fuertes y cortos. La selva está muy viva y hay menos visitantes, pero algunos caminos se embarran.",
        "From November to March it rains much more, often in short heavy downpours. The forest is bursting with life and there are fewer visitors, but some trails get muddy.",
        "De novembro a março chove muito mais, muitas vezes em pancadas fortes e curtas. A selva está muito viva e há menos visitantes, mas algumas trilhas ficam enlameadas."
      ),
    ],
    comoLlegar: [
      t(
        "En avión desde Cusco, en menos de una hora, o desde Lima. El aeropuerto está a pocos minutos de la ciudad y los lodges recogen allí mismo a los viajeros.",
        "By plane from Cusco, in under an hour, or from Lima. The airport is a few minutes from town and lodges pick travellers up right there.",
        "De avião desde Cusco, em menos de uma hora, ou desde Lima. O aeroporto fica a poucos minutos da cidade e os lodges buscam os viajantes ali mesmo."
      ),
      t(
        "Por tierra se llega desde Cusco por la carretera Interoceánica, en unas diez horas de bus. Desde el puerto, los lodges están a entre media hora y varias horas en bote, según lo lejos que se adentren en la reserva.",
        "Overland, the Interoceanic Highway links it with Cusco in about ten hours by bus. From the port, lodges are between half an hour and several hours away by boat, depending on how deep into the reserve they are.",
        "Por terra se chega de Cusco pela rodovia Interoceânica, em umas dez horas de ônibus. Do porto, os lodges ficam entre meia hora e várias horas de barco, conforme o quanto entram na reserva."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Tambopata o Manu?", "Tambopata or Manu?", "Tambopata ou Manu?"),
        respuesta: t(
          "Tambopata es más fácil: vuelo corto desde Cusco y lodges a poca distancia, ideal con tres días. El Manu exige un viaje largo por carretera, pero recorre desde los Andes hasta la selva baja. Si tienes poco tiempo, Tambopata.",
          "Tambopata is easier: a short flight from Cusco and lodges close by, ideal for three days. Manu requires a long road trip but takes you from the Andes down to the lowland jungle. If time is short, Tambopata.",
          "Tambopata é mais fácil: voo curto desde Cusco e lodges a pouca distância, ideal com três dias. O Manu exige uma longa viagem por estrada, mas vai dos Andes até a selva baixa. Se tem pouco tempo, Tambopata."
        ),
      },
      {
        pregunta: t("¿Cuántos días hacen falta en Tambopata?", "How many days do I need in Tambopata?", "Quantos dias são necessários em Tambopata?"),
        respuesta: t(
          "Tres días y dos noches dan para el lago Sandoval, una caminata nocturna y la selva cercana al lodge. Con cuatro días se suma la madrugada en una collpa de guacamayos.",
          "Three days and two nights cover Lake Sandoval, a night walk and the forest around the lodge. With four days you add a dawn visit to a macaw clay lick.",
          "Três dias e duas noites dão para o lago Sandoval, uma caminhada noturna e a selva perto do lodge. Com quatro dias se soma a madrugada num barreiro de araras."
        ),
      },
      {
        pregunta: t("¿Hay muchos mosquitos?", "Are there a lot of mosquitoes?", "Há muitos mosquitos?"),
        respuesta: t(
          "Sí, sobre todo al atardecer y en la época de lluvias. Lleva repelente y ropa de manga larga de colores claros; los lodges tienen mosquiteros en las camas.",
          "Yes, especially at dusk and in the rainy season. Bring repellent and long-sleeved clothes in light colours; lodges have mosquito nets over the beds.",
          "Sim, sobretudo ao entardecer e na época de chuvas. Leve repelente e roupas de manga comprida em cores claras; os lodges têm mosquiteiros nas camas."
        ),
      },
      {
        pregunta: t("¿Hace falta vacunarse?", "Do I need any vaccinations?", "É preciso se vacinar?"),
        respuesta: t(
          "Se suele recomendar la vacuna contra la fiebre amarilla, al menos diez días antes de viajar a la selva. Lo mejor es consultarlo con tu médico unas semanas antes del viaje.",
          "The yellow fever vaccine is usually recommended, at least ten days before travelling to the rainforest. It is best to check with your doctor a few weeks before your trip.",
          "Costuma-se recomendar a vacina contra a febre amarela, pelo menos dez dias antes de viajar à selva. O melhor é consultar seu médico algumas semanas antes da viagem."
        ),
      },
    ],
  },

  manu: {
    cerca: ["amazonia", "puerto-maldonado", "cusco"],
    clima: "amazonia",
    intro: [
      t(
        "El Parque Nacional del Manu, al noreste de Cusco, protege un territorio que baja desde los Andes, a más de 3500 metros, hasta la selva amazónica, a unos 300. En ese descenso caben bosques de nubes, ríos y selva baja, y por eso es uno de los lugares con más especies del planeta. Es Patrimonio de la Humanidad desde 1987.",
        "Manu National Park, north-east of Cusco, protects land that drops from the Andes, above 3,500 metres, down to the Amazon rainforest at around 300. That descent spans cloud forest, rivers and lowland jungle, making it one of the most species-rich places on the planet. It has been a World Heritage Site since 1987.",
        "O Parque Nacional do Manu, a nordeste de Cusco, protege um território que desce dos Andes, a mais de 3.500 metros, até a floresta amazônica, a cerca de 300. Nessa descida cabem florestas de nuvens, rios e selva baixa, e por isso é um dos lugares com mais espécies do planeta. É Patrimônio da Humanidade desde 1987."
      ),
      t(
        "Llegar es parte del viaje: se cruza la cordillera por carretera, se baja por el bosque de nubes donde vive el gallito de las rocas, el ave nacional del Perú, y se continúa en bote por el río. Los viajeros visitan la zona de amortiguamiento y la zona reservada; el corazón del parque solo está abierto a la investigación y a las comunidades que lo habitan.",
        "Getting there is part of the trip: you cross the mountains by road, descend through the cloud forest where the cock-of-the-rock, Peru's national bird, lives, and continue by boat along the river. Visitors explore the buffer zone and the reserved zone; the heart of the park is open only to research and the communities who live there.",
        "Chegar faz parte da viagem: cruza-se a cordilheira por estrada, desce-se pela floresta de nuvens onde vive o galo-da-serra, a ave nacional do Peru, e segue-se de barco pelo rio. Os viajantes visitam a zona de amortecimento e a zona reservada; o coração do parque só está aberto à pesquisa e às comunidades que o habitam."
      ),
    ],
    queVer: [
      {
        nombre: t("Bosque de nubes y gallito de las rocas", "Cloud forest and cock-of-the-rock", "Floresta de nuvens e galo-da-serra"),
        texto: t(
          "En la bajada de los Andes el bosque se cubre de musgos, orquídeas y helechos. Al amanecer, los machos del gallito de las rocas, de un rojo intenso, se reúnen para cortejar.",
          "On the way down from the Andes the forest is draped in moss, orchids and ferns. At dawn the bright red male cocks-of-the-rock gather to display.",
          "Na descida dos Andes a floresta se cobre de musgos, orquídeas e samambaias. Ao amanhecer, os machos do galo-da-serra, de um vermelho intenso, se reúnem para cortejar."
        ),
        tour: "manu-express",
      },
      {
        nombre: t("Mirador de Tres Cruces", "Tres Cruces viewpoint", "Mirante de Tres Cruces"),
        texto: t(
          "Un mirador a unos 3700 metros sobre el borde de la selva, famoso por sus amaneceres, cuando el sol sale sobre un mar de nubes.",
          "A viewpoint at around 3,700 metres on the edge of the rainforest, famous for its sunrises over a sea of clouds.",
          "Um mirante a cerca de 3.700 metros na borda da selva, famoso pelos amanheceres, quando o sol nasce sobre um mar de nuvens."
        ),
      },
      {
        nombre: t("Paucartambo", "Paucartambo", "Paucartambo"),
        texto: t(
          "Un pueblo colonial en el camino, con un puente de piedra sobre el río, famoso por la fiesta de la Virgen del Carmen en julio.",
          "A colonial town on the way, with a stone bridge over the river, famous for its Virgen del Carmen festival in July.",
          "Um povoado colonial no caminho, com uma ponte de pedra sobre o rio, famoso pela festa da Virgen del Carmen em julho."
        ),
      },
      {
        nombre: t("Collpa de guacamayos", "Macaw clay lick", "Barreiro de araras"),
        texto: t(
          "Un barranco de arcilla junto al río al que, de madrugada, bajan bandadas de guacamayos y loros. Se observa en silencio desde un escondite.",
          "A clay bank by the river where flocks of macaws and parrots come down at dawn. It is watched in silence from a hide.",
          "Um barranco de argila junto ao rio ao qual, de madrugada, descem bandos de araras e papagaios. Observa-se em silêncio de um esconderijo."
        ),
        tour: "manu-guacamayos",
      },
      {
        nombre: t("Cochas y nutrias gigantes", "Oxbow lakes and giant otters", "Lagos e ariranhas"),
        texto: t(
          "Lagunas en forma de herradura donde viven familias de nutrias gigantes, caimanes y aves acuáticas, que se recorren en catamarán.",
          "Horseshoe-shaped lakes home to giant otter families, caimans and waterbirds, explored by catamaran.",
          "Lagoas em forma de ferradura onde vivem famílias de ariranhas, jacarés e aves aquáticas, percorridas de catamarã."
        ),
        tour: "manu-guacamayos",
      },
      {
        nombre: t("Selva baja y río Alto Madre de Dios", "Lowland forest and the Alto Madre de Dios River", "Selva baixa e rio Alto Madre de Dios"),
        texto: t(
          "Caminatas con guía para buscar monos, tapires y huellas de jaguar, y noches en lodges junto al río.",
          "Guided walks in search of monkeys, tapirs and jaguar tracks, and nights in riverside lodges.",
          "Caminhadas com guia em busca de macacos, antas e pegadas de onça, e noites em lodges à beira do rio."
        ),
        tour: "manu-jungle",
      },
    ],
    cuandoIr: [
      t(
        "La mejor época es la seca, de mayo a octubre: la carretera está en mejor estado, los ríos tienen menos caudal y los animales se concentran cerca del agua.",
        "The best time is the dry season, from May to October: the road is in better shape, the rivers are lower and wildlife gathers near the water.",
        "A melhor época é a seca, de maio a outubro: a estrada está em melhor estado, os rios têm menos volume e os animais se concentram perto da água."
      ),
      t(
        "De noviembre a abril llueve mucho y la carretera de bajada puede sufrir derrumbes, así que los horarios se vuelven inciertos. Si viajas en esa época, deja un día de margen antes de tu vuelo de regreso.",
        "From November to April it rains heavily and landslides can affect the road down, making timings uncertain. If you travel then, leave a spare day before your flight home.",
        "De novembro a abril chove muito e a estrada de descida pode sofrer deslizamentos, então os horários ficam incertos. Se viajar nessa época, deixe um dia de folga antes do voo de volta."
      ),
    ],
    comoLlegar: [
      t(
        "Desde Cusco por carretera, pasando por Paucartambo y Tres Cruces: entre siete y diez horas hasta los primeros lodges del bosque de nubes, con paradas para ver aves por el camino.",
        "From Cusco by road, via Paucartambo and Tres Cruces: seven to ten hours to the first cloud-forest lodges, with birdwatching stops along the way.",
        "De Cusco por estrada, passando por Paucartambo e Tres Cruces: entre sete e dez horas até os primeiros lodges da floresta de nuvens, com paradas para observar aves pelo caminho."
      ),
      t(
        "A partir de ahí el viaje sigue en bote por el río Alto Madre de Dios. Todos los traslados van incluidos en el tour, que sale de Cusco y vuelve a Cusco.",
        "From there the journey continues by boat along the Alto Madre de Dios River. All transfers are included in the tour, which starts and ends in Cusco.",
        "A partir daí a viagem segue de barco pelo rio Alto Madre de Dios. Todos os traslados estão incluídos no tour, que sai de Cusco e volta a Cusco."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuántos días hacen falta para el Manu?", "How many days do I need for Manu?", "Quantos dias são necessários para o Manu?"),
        respuesta: t(
          "Tres días y dos noches para el bosque de nubes y la zona de amortiguamiento. Para llegar a la collpa de guacamayos y las lagunas de la zona reservada, cinco días o más.",
          "Three days and two nights for the cloud forest and the buffer zone. To reach the macaw clay lick and the lakes of the reserved zone, five days or more.",
          "Três dias e duas noites para a floresta de nuvens e a zona de amortecimento. Para chegar ao barreiro de araras e às lagoas da zona reservada, cinco dias ou mais."
        ),
      },
      {
        pregunta: t("¿Qué animales se ven en el Manu?", "What wildlife can I see in Manu?", "Que animais se veem no Manu?"),
        respuesta: t(
          "Casi seguro monos, aves de colores, guacamayos y el gallito de las rocas; con suerte, nutrias gigantes, tapires o caimanes. El jaguar vive aquí, pero verlo es muy raro.",
          "Almost certainly monkeys, colourful birds, macaws and the cock-of-the-rock; with luck, giant otters, tapirs or caimans. Jaguars live here, but sightings are very rare.",
          "Quase com certeza macacos, aves coloridas, araras e o galo-da-serra; com sorte, ariranhas, antas ou jacarés. A onça vive aqui, mas vê-la é muito raro."
        ),
      },
      {
        pregunta: t("¿Manu o Tambopata?", "Manu or Tambopata?", "Manu ou Tambopata?"),
        respuesta: t(
          "El Manu es más salvaje y variado, pero exige más días y un viaje largo por carretera. Tambopata es más fácil, con un vuelo corto desde Cusco. Si tienes cinco días o más y te gusta la naturaleza, el Manu.",
          "Manu is wilder and more varied, but needs more days and a long road journey. Tambopata is easier, with a short flight from Cusco. If you have five days or more and love nature, Manu.",
          "O Manu é mais selvagem e variado, mas exige mais dias e uma longa viagem por estrada. Tambopata é mais fácil, com um voo curto desde Cusco. Se tem cinco dias ou mais e gosta de natureza, o Manu."
        ),
      },
      {
        pregunta: t("¿Es un viaje duro?", "Is it a tough trip?", "É uma viagem difícil?"),
        respuesta: t(
          "No exige estar en forma: las caminatas son llanas y cortas. Lo que cansa son las horas de carretera y los madrugones. Para las curvas del primer día ayuda llevar pastillas contra el mareo.",
          "You do not need to be very fit: the walks are flat and short. What tires you are the hours on the road and the early starts. Motion-sickness tablets help on the winding first day.",
          "Não exige preparo físico: as caminhadas são planas e curtas. O que cansa são as horas de estrada e as madrugadas. Para as curvas do primeiro dia ajuda levar remédio contra enjoo."
        ),
      },
    ],
  },

  norte: {
    cerca: ["lima", "amazonia"],
    intro: [
      t(
        "El norte del Perú guarda algunas de las joyas arqueológicas del país, y todavía lo visitan pocos viajeros: las tumbas del Señor de Sipán, la ciudad de barro de Chan Chan y la fortaleza de Kuélap, en las montañas de Chachapoyas. Aquí florecieron culturas como la moche, la chimú y la chachapoya, anteriores a los incas.",
        "Northern Peru holds some of the country's archaeological treasures, and still sees few travellers: the tombs of the Lord of Sipán, the mud city of Chan Chan and the fortress of Kuélap, in the mountains of Chachapoyas. Cultures such as the Moche, Chimú and Chachapoya flourished here before the Incas.",
        "O norte do Peru guarda algumas das joias arqueológicas do país, e ainda recebe poucos viajantes: os túmulos do Senhor de Sipán, a cidade de barro de Chan Chan e a fortaleza de Kuélap, nas montanhas de Chachapoyas. Aqui floresceram culturas como a moche, a chimú e a chachapoya, anteriores aos incas."
      ),
      t(
        "Tiene además sol casi todo el año en la costa, playas como Huanchaco, donde los pescadores aún salen al mar en caballitos de totora, y la cordillera Blanca de Huaraz, con el Huascarán, la montaña más alta del Perú. Es un viaje para quien ya conoce Cusco o busca rutas con menos gente.",
        "It also has sunshine almost all year on the coast, beaches like Huanchaco, where fishermen still head out to sea on reed boats called caballitos de totora, and Huaraz's Cordillera Blanca, home to Huascarán, Peru's highest mountain. It is a trip for those who already know Cusco or want quieter routes.",
        "Tem ainda sol quase o ano todo na costa, praias como Huanchaco, onde os pescadores ainda saem ao mar em caballitos de totora, e a Cordilheira Branca de Huaraz, com o Huascarán, a montanha mais alta do Peru. É uma viagem para quem já conhece Cusco ou busca rotas com menos gente."
      ),
    ],
    queVer: [
      {
        nombre: t("Chan Chan y las huacas moche", "Chan Chan and the Moche temples", "Chan Chan e as huacas moche"),
        texto: t(
          "La mayor ciudad de barro de la América precolombina, capital del reino chimú y Patrimonio de la Humanidad. Muy cerca, las Huacas del Sol y de la Luna conservan murales moche de colores.",
          "The largest adobe city of pre-Columbian America, capital of the Chimú kingdom and a World Heritage Site. Close by, the Huacas del Sol y de la Luna still hold colourful Moche murals.",
          "A maior cidade de barro da América pré-colombiana, capital do reino chimú e Patrimônio da Humanidade. Bem perto, as Huacas do Sol e da Lua conservam murais moche coloridos."
        ),
        tour: "trujillo-chanchan",
      },
      {
        nombre: t("Huanchaco", "Huanchaco", "Huanchaco"),
        texto: t(
          "Un pueblo de playa junto a Trujillo, con buenas olas para el surf y pescadores que salen al mar en caballitos de totora, como hace siglos.",
          "A beach town next to Trujillo, with good surf and fishermen who still put to sea on reed boats, as they have for centuries.",
          "Um povoado de praia perto de Trujillo, com boas ondas para o surfe e pescadores que saem ao mar em caballitos de totora, como há séculos."
        ),
        tour: "huanchaco",
      },
      {
        nombre: t("Señor de Sipán y Túcume", "Lord of Sipán and Túcume", "Senhor de Sipán e Túcume"),
        texto: t(
          "Cerca de Chiclayo, el Museo Tumbas Reales de Sipán muestra el ajuar de oro de un gobernante moche, y en Túcume se alzan más de veinte pirámides de adobe.",
          "Near Chiclayo, the Royal Tombs of Sipán Museum displays the gold treasures of a Moche ruler, and at Túcume more than twenty adobe pyramids rise from the plain.",
          "Perto de Chiclayo, o Museu Tumbas Reales de Sipán mostra o enxoval de ouro de um governante moche, e em Túcume se erguem mais de vinte pirâmides de adobe."
        ),
        tour: "chiclayo-tucume",
      },
      {
        nombre: t("Kuélap y la catarata de Gocta", "Kuélap and Gocta Falls", "Kuélap e a cachoeira de Gocta"),
        texto: t(
          "Una fortaleza de piedra en lo alto de una montaña, con murallas de hasta 20 metros y cientos de casas circulares chachapoya. Cerca cae Gocta, una de las cataratas más altas del mundo, de unos 770 metros.",
          "A stone fortress on a mountaintop, with walls up to 20 metres high and hundreds of round Chachapoya houses. Nearby falls Gocta, one of the tallest waterfalls in the world, at around 770 metres.",
          "Uma fortaleza de pedra no alto de uma montanha, com muralhas de até 20 metros e centenas de casas circulares chachapoya. Perto cai Gocta, uma das cachoeiras mais altas do mundo, com cerca de 770 metros."
        ),
        tour: "kuelap-gocta",
      },
      {
        nombre: t("Sarcófagos de Karajía", "Karajía sarcophagi", "Sarcófagos de Karajía"),
        texto: t(
          "Figuras funerarias de más de dos metros colocadas en lo alto de un acantilado por los chachapoya, mirando al valle desde hace siglos.",
          "Funerary figures over two metres tall, set high on a cliff face by the Chachapoya, gazing over the valley for centuries.",
          "Figuras funerárias de mais de dois metros colocadas no alto de um penhasco pelos chachapoyas, olhando para o vale há séculos."
        ),
        tour: "chachapoyas-3d",
      },
      {
        nombre: t("Huaraz y la laguna 69", "Huaraz and Lake 69", "Huaraz e a laguna 69"),
        texto: t(
          "En la cordillera Blanca, una caminata de un día hasta una laguna turquesa a unos 4600 metros, al pie de los glaciares.",
          "In the Cordillera Blanca, a day hike to a turquoise lake at around 4,600 metres, at the foot of the glaciers.",
          "Na Cordilheira Branca, uma caminhada de um dia até uma lagoa turquesa a cerca de 4.600 metros, ao pé das geleiras."
        ),
        tour: "huaraz-laguna-69",
      },
    ],
    cuandoIr: [
      t(
        "La costa norte —Trujillo, Chiclayo, Huanchaco— tiene sol casi todo el año, con más calor de diciembre a abril. Es la región para escapar del cielo gris de Lima en invierno.",
        "The northern coast —Trujillo, Chiclayo, Huanchaco— enjoys sunshine almost all year, hottest from December to April. It is the place to escape Lima's grey winter skies.",
        "A costa norte —Trujillo, Chiclayo, Huanchaco— tem sol quase o ano todo, com mais calor de dezembro a abril. É a região para fugir do céu cinza de Lima no inverno."
      ),
      t(
        "En la sierra, Chachapoyas y Huaraz, lo mejor es la época seca, de mayo a septiembre: caminos firmes y cielos despejados para Kuélap, Gocta y la laguna 69. De enero a marzo las lluvias complican las rutas de montaña.",
        "In the highlands, Chachapoyas and Huaraz, the dry season from May to September is best: firm trails and clear skies for Kuélap, Gocta and Lake 69. From January to March the rains make mountain routes harder.",
        "Na serra, Chachapoyas e Huaraz, o melhor é a estação seca, de maio a setembro: caminhos firmes e céu limpo para Kuélap, Gocta e a laguna 69. De janeiro a março as chuvas complicam as rotas de montanha."
      ),
    ],
    comoLlegar: [
      t(
        "Hay vuelos desde Lima a Trujillo y a Chiclayo, de algo más de una hora. Para Chachapoyas se suele volar a Jaén y seguir unas tres o cuatro horas por carretera, o viajar en bus desde Chiclayo.",
        "There are flights from Lima to Trujillo and Chiclayo, just over an hour. For Chachapoyas, most people fly to Jaén and continue three to four hours by road, or take a bus from Chiclayo.",
        "Há voos de Lima para Trujillo e Chiclayo, de pouco mais de uma hora. Para Chachapoyas costuma-se voar a Jaén e seguir três ou quatro horas por estrada, ou viajar de ônibus desde Chiclayo."
      ),
      t(
        "Huaraz está a unas ocho horas en bus desde Lima. Entre Trujillo y Chiclayo hay unas tres horas por la Panamericana, así que las dos ciudades se combinan bien en un mismo viaje.",
        "Huaraz is about eight hours by bus from Lima. Trujillo and Chiclayo are around three hours apart on the Pan-American Highway, so the two cities combine easily in one trip.",
        "Huaraz fica a cerca de oito horas de ônibus de Lima. Entre Trujillo e Chiclayo há umas três horas pela Pan-Americana, então as duas cidades se combinam bem numa mesma viagem."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuántos días hacen falta para el norte?", "How many days do I need for northern Peru?", "Quantos dias são necessários para o norte?"),
        respuesta: t(
          "Cinco días dan para Trujillo, Chiclayo y Chachapoyas con Kuélap. Si sumas Huaraz, cuenta con tres o cuatro días más, porque está en otra ruta.",
          "Five days cover Trujillo, Chiclayo and Chachapoyas with Kuélap. If you add Huaraz, allow three or four more days, as it is on a different route.",
          "Cinco dias dão para Trujillo, Chiclayo e Chachapoyas com Kuélap. Se somar Huaraz, conte com mais três ou quatro dias, porque fica em outra rota."
        ),
      },
      {
        pregunta: t("¿Afecta la altura en el norte?", "Does altitude affect you in the north?", "A altitude afeta no norte?"),
        respuesta: t(
          "En la costa no. Chachapoyas está a unos 2300 metros y se lleva bien; en Huaraz, a unos 3000, conviene aclimatarse un par de días antes de subir a la laguna 69, que pasa de los 4500.",
          "Not on the coast. Chachapoyas lies at about 2,300 metres and is easy going; in Huaraz, at around 3,000, it is wise to acclimatise for a couple of days before hiking to Lake 69, which is above 4,500.",
          "Na costa não. Chachapoyas fica a cerca de 2.300 metros e se tolera bem; em Huaraz, a uns 3.000, convém se aclimatar uns dois dias antes de subir à laguna 69, que passa dos 4.500."
        ),
      },
      {
        pregunta: t("¿Qué comer en el norte?", "What should I eat in the north?", "O que comer no norte?"),
        respuesta: t(
          "El ceviche de la costa norte, el arroz con pato de Chiclayo, el cabrito a la norteña, el shámbar que en Trujillo se come los lunes y, de postre, el king kong de Lambayeque.",
          "Northern-style ceviche, Chiclayo's arroz con pato (rice with duck), cabrito a la norteña (braised kid), the shámbar soup Trujillo eats on Mondays and, for dessert, Lambayeque's king kong.",
          "O ceviche da costa norte, o arroz con pato de Chiclayo, o cabrito a la norteña, o shámbar que em Trujillo se come às segundas e, de sobremesa, o king kong de Lambayeque."
        ),
      },
      {
        pregunta: t("¿Se pueden ver Kuélap y Gocta en un mismo viaje?", "Can I see Kuélap and Gocta on the same trip?", "Dá para ver Kuélap e Gocta numa mesma viagem?"),
        respuesta: t(
          "Sí, es lo más habitual: los dos están cerca de Chachapoyas y se ven en dos días. Con un día más se añaden los sarcófagos de Karajía y otros sitios chachapoya.",
          "Yes, that is the usual plan: both are near Chachapoyas and can be seen in two days. One more day adds the Karajía sarcophagi and other Chachapoya sites.",
          "Sim, é o mais comum: os dois ficam perto de Chachapoyas e se veem em dois dias. Com mais um dia se acrescentam os sarcófagos de Karajía e outros sítios chachapoya."
        ),
      },
    ],
  },
};
