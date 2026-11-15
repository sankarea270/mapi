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
  intro: LocalizedText[];
  queVer: LugarDestino[];
  cuandoIr: LocalizedText[];
  comoLlegar: LocalizedText[];
  preguntas: PreguntaDestino[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

export const GUIAS_DESTINO: Record<string, GuiaDestino> = {
  cusco: {
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
};
