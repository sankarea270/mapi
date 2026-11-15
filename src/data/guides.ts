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

/*
 * El cuerpo de las guías. El título, el resumen y la foto salen del panel;
 * los apartados, de aquí.
 *
 * Se ampliaron en noviembre de 2026: cada guía tenía tres párrafos y unas
 * 100 palabras, y «Cómo llegar», que ya sale en la primera página de Google,
 * se quedaba corta frente a lo que se busca. Ningún precio ni horario de
 * trenes o vuelos, que envejecerían sin que nadie lo notara; los requisitos
 * de entrada remiten siempre a la fuente oficial, porque cambian.
 */
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
        heading: t("Aeropuerto Jorge Chávez (Lima)", "Jorge Chávez Airport (Lima)", "Aeroporto Jorge Chávez (Lima)"),
        body: t(
          "El Aeropuerto Internacional Jorge Chávez, en el Callao, es la principal puerta de entrada al Perú. Recibe vuelos directos desde América y Europa, y conexiones desde Asia y Oceanía. Casi todos los viajes empiezan aquí, aunque el destino final sea Cusco. Si llegas de noche y vuelas a Cusco a primera hora, muchos viajeros duermen cerca del aeropuerto en lugar de cruzar la ciudad.",
          "Jorge Chávez International Airport, in Callao, is Peru's main gateway. It receives direct flights from the Americas and Europe, and connections from Asia and Oceania. Almost every trip starts here, even when the final destination is Cusco. If you land at night and fly to Cusco first thing in the morning, many travellers sleep near the airport rather than crossing the city.",
          "O Aeroporto Internacional Jorge Chávez, em Callao, é a principal porta de entrada do Peru. Recebe voos diretos da América e da Europa, e conexões da Ásia e da Oceania. Quase todas as viagens começam aqui, mesmo quando o destino final é Cusco. Se você chega à noite e voa para Cusco logo cedo, muitos viajantes dormem perto do aeroporto em vez de atravessar a cidade."
        ),
      },
      {
        heading: t("Del aeropuerto a la ciudad", "From the airport to the city", "Do aeroporto à cidade"),
        body: t(
          "Hasta Miraflores o Barranco se tarda entre 40 minutos y más de una hora, según el tráfico. Usa un taxi oficial del aeropuerto, una aplicación de transporte o el traslado que coordinamos contigo; evita los taxis informales que ofrecen servicio a la salida. Si contratas un paquete con nosotros, te esperamos con un cartel con tu nombre.",
          "Getting to Miraflores or Barranco takes from 40 minutes to over an hour, depending on traffic. Use an official airport taxi, a ride-hailing app or the transfer we arrange with you; avoid informal taxis touting at the exit. If you book a package with us, we meet you holding a sign with your name.",
          "Até Miraflores ou Barranco leva de 40 minutos a mais de uma hora, conforme o trânsito. Use um táxi oficial do aeroporto, um aplicativo de transporte ou o traslado que combinamos com você; evite os táxis informais que oferecem serviço na saída. Se contratar um pacote conosco, esperamos você com uma placa com seu nome."
        ),
      },
      {
        heading: t("Vuelos internos", "Domestic flights", "Voos domésticos"),
        body: t(
          "El vuelo de Lima a Cusco dura algo más de una hora y hay salidas durante todo el día; los de primera hora suelen ser los más puntuales, porque por la tarde el viento en Cusco puede causar retrasos. También hay vuelos a Arequipa, Juliaca (para Puno), Puerto Maldonado, Iquitos, Trujillo y Chiclayo. Deja siempre margen entre un vuelo internacional y uno nacional.",
          "The flight from Lima to Cusco takes just over an hour, with departures all day; early-morning flights tend to be the most punctual, as afternoon winds in Cusco can cause delays. There are also flights to Arequipa, Juliaca (for Puno), Puerto Maldonado, Iquitos, Trujillo and Chiclayo. Always leave a buffer between an international and a domestic flight.",
          "O voo de Lima para Cusco dura pouco mais de uma hora, com saídas durante todo o dia; os voos bem cedo costumam ser os mais pontuais, porque à tarde o vento em Cusco pode causar atrasos. Também há voos para Arequipa, Juliaca (para Puno), Puerto Maldonado, Iquitos, Trujillo e Chiclayo. Deixe sempre uma margem entre um voo internacional e um doméstico."
        ),
      },
      {
        heading: t("En bus por el país", "Travelling by bus", "De ônibus pelo país"),
        body: t(
          "Las empresas de bus de larga distancia unen las principales ciudades con buses cómodos, muchos con asientos que se reclinan casi por completo para viajar de noche. Son una buena opción entre Arequipa, Puno y Cusco, o por la costa hacia Paracas y Nazca. Elige empresas reconocidas y viaja con tus objetos de valor contigo, no en la bodega.",
          "Long-distance bus companies link the main cities with comfortable coaches, many with near-flat seats for overnight travel. They are a good option between Arequipa, Puno and Cusco, or along the coast to Paracas and Nazca. Choose well-known companies and keep your valuables with you, not in the luggage hold.",
          "As empresas de ônibus de longa distância ligam as principais cidades com ônibus confortáveis, muitos com assentos que reclinam quase totalmente para viajar à noite. São uma boa opção entre Arequipa, Puno e Cusco, ou pela costa até Paracas e Nazca. Escolha empresas reconhecidas e leve seus objetos de valor com você, não no bagageiro."
        ),
      },
      {
        heading: t("En tren a Machu Picchu", "By train to Machu Picchu", "De trem a Machu Picchu"),
        body: t(
          "A Machu Picchu no se llega por carretera: se toma el tren hasta Aguas Calientes, casi siempre desde Ollantaytambo, en el Valle Sagrado, y desde allí un bus sube a la ciudadela. Hay trenes de distintas categorías, del más sencillo a los de lujo. Las plazas y las entradas son limitadas, así que conviene reservar ambas con antelación, sobre todo de mayo a octubre.",
          "There is no road to Machu Picchu: you take the train to Aguas Calientes, usually from Ollantaytambo in the Sacred Valley, and from there a bus climbs to the citadel. Trains come in different categories, from basic to luxury. Seats and entry tickets are limited, so book both well ahead, especially from May to October.",
          "A Machu Picchu não se chega por estrada: pega-se o trem até Aguas Calientes, quase sempre desde Ollantaytambo, no Vale Sagrado, e de lá um ônibus sobe até a cidadela. Há trens de diferentes categorias, do mais simples aos de luxo. Os lugares e os ingressos são limitados, então convém reservar ambos com antecedência, sobretudo de maio a outubro."
        ),
      },
      {
        heading: t("Documentos al llegar", "Documents on arrival", "Documentos na chegada"),
        body: t(
          "Necesitas un pasaporte vigente; muchos países piden que tenga al menos seis meses de validez. La Tarjeta Andina de Migración es electrónica y ya no se rellena en papel. Consulta los requisitos de tu nacionalidad en nuestra guía de visas antes de comprar el vuelo, y lleva el pasaporte a mano durante el viaje: lo piden en hoteles, trenes y en la entrada a Machu Picchu.",
          "You need a valid passport; many countries require at least six months' validity. The Andean Migration Card is electronic and no longer filled in on paper. Check the requirements for your nationality in our visa guide before buying your flight, and keep your passport handy throughout: hotels, trains and the Machu Picchu entrance all ask for it.",
          "Você precisa de passaporte válido; muitos países exigem pelo menos seis meses de validade. O Cartão Andino de Migração é eletrônico e não é mais preenchido em papel. Consulte os requisitos da sua nacionalidade no nosso guia de vistos antes de comprar a passagem, e leve o passaporte à mão durante a viagem: hotéis, trens e a entrada de Machu Picchu pedem o documento."
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
        heading: t("Tres regiones, tres climas", "Three regions, three climates", "Três regiões, três climas"),
        body: t(
          "El Perú no tiene un solo clima: en la costa casi nunca llueve, en los Andes hay una estación seca y otra de lluvias, y en la selva llueve todo el año, aunque más en unos meses que en otros. Por eso la mejor época depende de adónde vayas. Para un primer viaje centrado en Cusco y Machu Picchu, lo ideal es de abril a octubre.",
          "Peru does not have a single climate: on the coast it hardly ever rains, the Andes have a dry season and a rainy season, and in the rainforest it rains all year, though more in some months than others. So the best time depends on where you go. For a first trip centred on Cusco and Machu Picchu, April to October is ideal.",
          "O Peru não tem um único clima: na costa quase nunca chove, nos Andes há uma estação seca e outra de chuvas, e na selva chove o ano todo, embora mais em alguns meses. Por isso a melhor época depende de para onde você vai. Para uma primeira viagem centrada em Cusco e Machu Picchu, o ideal é de abril a outubro."
        ),
      },
      {
        heading: t("Temporada seca en los Andes (mayo – octubre)", "Dry season in the Andes (May – October)", "Estação seca nos Andes (maio – outubro)"),
        body: t(
          "Es la mejor época para el trekking: Camino Inca, Salkantay, Ausangate y la Montaña de 7 Colores con cielos despejados. Los días son soleados y templados, y las noches frías, con heladas en junio y julio. Es también la temporada alta: los trenes, los hoteles y las entradas a Machu Picchu se llenan antes, así que conviene reservar con meses de antelación.",
          "This is the best season for trekking: the Inca Trail, Salkantay, Ausangate and Rainbow Mountain under clear skies. Days are sunny and mild and nights are cold, with frosts in June and July. It is also high season: trains, hotels and Machu Picchu tickets sell out sooner, so book months ahead.",
          "É a melhor época para trekking: Trilha Inca, Salkantay, Ausangate e Montanha das 7 Cores com céu limpo. Os dias são ensolarados e amenos, e as noites frias, com geadas em junho e julho. É também a alta temporada: trens, hotéis e ingressos para Machu Picchu esgotam antes, então convém reservar com meses de antecedência."
        ),
      },
      {
        heading: t("Temporada de lluvias (noviembre – abril)", "Rainy season (November – April)", "Estação de chuvas (novembro – abril)"),
        body: t(
          "Llueve sobre todo por las tardes, y el paisaje andino está verde y con menos visitantes. Machu Picchu se visita igual, a menudo con nubes que dan fotos espectaculares. El Camino Inca cierra en febrero por mantenimiento. Lleva un impermeable ligero, deja margen en los traslados por si hay retrasos y elige excursiones flexibles.",
          "It rains mostly in the afternoons, and the Andean landscape is green with fewer visitors. Machu Picchu can still be visited, often with clouds that make for spectacular photos. The Inca Trail closes in February for maintenance. Bring a light rain jacket, leave room in transfers for delays and choose flexible excursions.",
          "Chove sobretudo à tarde, e a paisagem andina fica verde e com menos visitantes. Machu Picchu continua sendo visitado, muitas vezes com nuvens que rendem fotos espetaculares. A Trilha Inca fecha em fevereiro para manutenção. Leve uma capa de chuva leve, deixe margem nos traslados para possíveis atrasos e escolha passeios flexíveis."
        ),
      },
      {
        heading: t("Costa y selva", "Coast and rainforest", "Costa e selva"),
        body: t(
          "En Lima y la costa sur, de diciembre a abril es verano, con sol y calor; de junio a octubre el cielo se cubre de una neblina gris, aunque casi no llueve. La costa norte tiene sol casi todo el año. En la Amazonía, de mayo a octubre llueve menos y los senderos están más secos, mientras que de diciembre a mayo los ríos crecen y en Iquitos se navega por el bosque inundado.",
          "In Lima and on the southern coast, December to April is summer, sunny and hot; from June to October the sky is covered by a grey mist, although it hardly rains. The northern coast is sunny almost all year. In the Amazon, it rains less from May to October and trails are drier, while from December to May the rivers rise and in Iquitos you can boat through the flooded forest.",
          "Em Lima e na costa sul, de dezembro a abril é verão, com sol e calor; de junho a outubro o céu se cobre de uma névoa cinza, embora quase não chova. A costa norte tem sol quase o ano todo. Na Amazônia, de maio a outubro chove menos e as trilhas ficam mais secas, enquanto de dezembro a maio os rios sobem e em Iquitos se navega pela floresta alagada."
        ),
      },
      {
        heading: t("Fiestas y eventos", "Festivals and events", "Festas e eventos"),
        body: t(
          "En febrero, la Virgen de la Candelaria llena Puno de danzas. En junio, Cusco celebra el Corpus Christi y el Inti Raymi (24 de junio), y en julio Paucartambo honra a la Virgen del Carmen. Son experiencias únicas, pero en esas fechas los precios suben y los hoteles se agotan: si quieres vivirlas, reserva con mucha antelación.",
          "In February, the Virgen de la Candelaria festival fills Puno with dancing. In June, Cusco celebrates Corpus Christi and Inti Raymi (24 June), and in July Paucartambo honours the Virgen del Carmen. They are unique experiences, but prices rise and hotels sell out on those dates: if you want to be there, book well ahead.",
          "Em fevereiro, a Virgen de la Candelaria enche Puno de danças. Em junho, Cusco celebra o Corpus Christi e o Inti Raymi (24 de junho), e em julho Paucartambo homenageia a Virgen del Carmen. São experiências únicas, mas nessas datas os preços sobem e os hotéis esgotam: se quiser vivê-las, reserve com bastante antecedência."
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
          "En los Andes el clima cambia en minutos y entre el mediodía y la noche puede haber más de 20 grados de diferencia. Lo práctico es vestirse por capas: una camiseta térmica, un polar, un cortavientos y una chaqueta impermeable. Añade un gorro, guantes y una bufanda para las madrugadas, aunque viajes en temporada seca.",
          "In the Andes the weather changes within minutes, and there can be more than 20 °C between midday and night. The practical approach is layers: a thermal top, a fleece, a windbreaker and a waterproof jacket. Add a hat, gloves and a scarf for early mornings, even in the dry season.",
          "Nos Andes o clima muda em minutos, e entre o meio-dia e a noite pode haver mais de 20 graus de diferença. O prático é se vestir em camadas: uma camiseta térmica, um fleece, um corta-vento e uma jaqueta impermeável. Acrescente gorro, luvas e cachecol para as madrugadas, mesmo na estação seca."
        ),
      },
      {
        heading: t("Calzado", "Footwear", "Calçados"),
        body: t(
          "Unas zapatillas de trekking o botas ligeras, ya usadas antes del viaje, son lo más importante de la maleta: en Machu Picchu, en los sitios arqueológicos y en las calles empedradas de Cusco se camina mucho y por terreno irregular. Para la selva sirve calzado que se pueda mojar; los lodges suelen prestar botas de goma.",
          "A pair of trail shoes or light hiking boots, broken in before the trip, is the most important item in your luggage: at Machu Picchu, at archaeological sites and on Cusco's cobbled streets you walk a lot on uneven ground. For the rainforest, bring shoes that can get wet; lodges usually lend rubber boots.",
          "Um tênis de trekking ou botas leves, já usados antes da viagem, são o item mais importante da mala: em Machu Picchu, nos sítios arqueológicos e nas ruas de pedra de Cusco se caminha muito e em terreno irregular. Para a selva serve calçado que possa molhar; os lodges costumam emprestar botas de borracha."
        ),
      },
      {
        heading: t("Altura y sol", "Altitude and sun", "Altitude e sol"),
        body: t(
          "Protector solar de alta protección, labial con filtro, gorra o sombrero y gafas de sol son imprescindibles: en la altura la radiación es intensa aunque haga frío o esté nublado. Lleva también tus medicamentos habituales y consulta a tu médico si conviene algo para el mal de altura.",
          "High-factor sunscreen, lip balm with SPF, a cap or hat and sunglasses are essential: radiation at altitude is intense even when it is cold or cloudy. Bring your usual medication too, and ask your doctor whether you should take anything for altitude sickness.",
          "Protetor solar de alta proteção, protetor labial com filtro, boné ou chapéu e óculos de sol são indispensáveis: na altitude a radiação é intensa mesmo com frio ou nublado. Leve também seus remédios habituais e consulte seu médico se convém algo para o mal da altitude."
        ),
      },
      {
        heading: t("Para la selva", "For the rainforest", "Para a selva"),
        body: t(
          "Ropa ligera de manga larga y colores claros, repelente de insectos, un impermeable, una linterna o frontal, una bolsa estanca para la cámara y el móvil, y prismáticos si tienes. Deja en Cusco o en Lima lo que no necesites: en los traslados en bote se viaja con equipaje reducido.",
          "Light long-sleeved clothing in pale colours, insect repellent, a rain jacket, a torch or headlamp, a dry bag for your camera and phone, and binoculars if you have them. Leave what you do not need in Cusco or Lima: boat transfers are made with light luggage.",
          "Roupas leves de manga comprida e cores claras, repelente de insetos, capa de chuva, lanterna ou lanterna de cabeça, um saco estanque para a câmera e o celular, e binóculos se tiver. Deixe em Cusco ou em Lima o que não precisar: nos traslados de barco se viaja com bagagem reduzida."
        ),
      },
      {
        heading: t("Extras útiles", "Useful extras", "Extras úteis"),
        body: t(
          "Una botella reutilizable, algo de comida energética para las caminatas, una batería externa, un adaptador de enchufe (en el Perú la corriente es de 220 V y los enchufes, de tipo A y C), copias de tus documentos y algo de efectivo en soles con billetes pequeños, que en los mercados y pueblos es lo que más se usa.",
          "A reusable bottle, some energy snacks for hikes, a power bank, a plug adapter (Peru uses 220 V and type A and C sockets), copies of your documents and some cash in soles in small notes, which is what markets and villages mostly use.",
          "Uma garrafa reutilizável, algum lanche energético para as caminhadas, um carregador portátil, um adaptador de tomada (no Peru a corrente é de 220 V e as tomadas, do tipo A e C), cópias dos seus documentos e algum dinheiro em soles em notas pequenas, que é o mais usado em mercados e povoados."
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
          "Las zonas turísticas de Cusco, Lima, Arequipa y Puno son tranquilas para pasear con las precauciones de cualquier ciudad grande. Lleva tus pertenencias a la vista, la mochila por delante en mercados y lugares concurridos, y el móvil guardado cuando no lo uses. Por la noche, muévete en taxi en lugar de caminar por calles vacías.",
          "The tourist areas of Cusco, Lima, Arequipa and Puno are relaxed places to walk with the usual big-city precautions. Keep your belongings in sight, wear your backpack on your front in markets and crowded places, and put your phone away when not using it. At night, take a taxi rather than walking down empty streets.",
          "As áreas turísticas de Cusco, Lima, Arequipa e Puno são tranquilas para passear com os cuidados de qualquer cidade grande. Mantenha seus pertences à vista, a mochila na frente em mercados e lugares movimentados, e o celular guardado quando não estiver usando. À noite, prefira táxi a caminhar por ruas vazias."
        ),
      },
      {
        heading: t("Taxis, cajeros y dinero", "Taxis, ATMs and money", "Táxis, caixas eletrônicos e dinheiro"),
        body: t(
          "Usa taxis de empresas reconocidas o aplicaciones de transporte, y acuerda el precio antes de subir si el taxi no tiene taxímetro. Saca dinero en cajeros dentro de bancos o centros comerciales y de día. Lleva solo el efectivo del día y deja el resto, con el pasaporte, en la caja fuerte del hotel.",
          "Use taxis from well-known companies or ride-hailing apps, and agree the fare before getting in if there is no meter. Withdraw money from ATMs inside banks or shopping centres, during the day. Carry only the cash you need for the day and leave the rest, along with your passport, in the hotel safe.",
          "Use táxis de empresas reconhecidas ou aplicativos de transporte, e combine o preço antes de entrar se o táxi não tiver taxímetro. Saque dinheiro em caixas eletrônicos dentro de bancos ou shoppings e de dia. Leve só o dinheiro do dia e deixe o resto, com o passaporte, no cofre do hotel."
        ),
      },
      {
        heading: t("La altura", "Altitude", "A altitude"),
        body: t(
          "El soroche o mal de altura es el problema de salud más habitual del viaje: dolor de cabeza, cansancio o falta de aire en Cusco, Puno o el Colca. Llega con calma, descansa el primer día, bebe mucha agua, come ligero y evita el alcohol las primeras horas. Si los síntomas empeoran, avisa a tu guía y busca atención médica.",
          "Altitude sickness, known locally as soroche, is the most common health issue of the trip: headaches, tiredness or shortness of breath in Cusco, Puno or the Colca. Arrive slowly, rest on the first day, drink plenty of water, eat light and avoid alcohol for the first hours. If symptoms get worse, tell your guide and seek medical care.",
          "O soroche, ou mal da altitude, é o problema de saúde mais comum da viagem: dor de cabeça, cansaço ou falta de ar em Cusco, Puno ou no Colca. Chegue com calma, descanse no primeiro dia, beba muita água, coma leve e evite álcool nas primeiras horas. Se os sintomas piorarem, avise seu guia e procure atendimento médico."
        ),
      },
      {
        heading: t("En la naturaleza", "In nature", "Na natureza"),
        body: t(
          "Sigue siempre a tu guía en senderos y miradores, no te salgas de la ruta y respeta las indicaciones de los parques nacionales y sitios arqueológicos. En el trekking, camina a tu ritmo y avisa si te sientes mal. En la selva, no toques plantas ni animales y no camines solo fuera del lodge, sobre todo de noche.",
          "Always follow your guide on trails and viewpoints, stay on the route and respect the rules of national parks and archaeological sites. On treks, walk at your own pace and speak up if you feel unwell. In the rainforest, do not touch plants or animals and do not walk alone away from the lodge, especially at night.",
          "Siga sempre o seu guia em trilhas e mirantes, não saia da rota e respeite as orientações dos parques nacionais e sítios arqueológicos. No trekking, caminhe no seu ritmo e avise se não se sentir bem. Na selva, não toque em plantas nem animais e não caminhe sozinho longe do lodge, sobretudo à noite."
        ),
      },
      {
        heading: t("Comida y agua", "Food and water", "Comida e água"),
        body: t(
          "No bebas agua del grifo: usa agua embotellada o filtrada, también para lavarte los dientes si tienes el estómago sensible. Los primeros días, prefiere comida cocinada y fruta que se pela. La cocina peruana es uno de los placeres del viaje; solo conviene ir poco a poco con los platos crudos y muy picantes.",
          "Do not drink tap water: use bottled or filtered water, including for brushing your teeth if you have a sensitive stomach. In the first days, stick to cooked food and fruit you can peel. Peruvian food is one of the joys of the trip; just take it slowly with raw and very spicy dishes.",
          "Não beba água da torneira: use água engarrafada ou filtrada, inclusive para escovar os dentes se tiver estômago sensível. Nos primeiros dias, prefira comida cozida e frutas que se descascam. A cozinha peruana é um dos prazeres da viagem; só convém ir aos poucos com os pratos crus e muito picantes."
        ),
      },
      {
        heading: t("Emergencias", "Emergencies", "Emergências"),
        body: t(
          "Guarda los números de emergencia: policía 105, bomberos 116 y ambulancia (SAMU) 106. Ten a mano el contacto de tu seguro de viaje y el de tu agencia; nuestro equipo está disponible las 24 horas durante tu viaje. Una copia digital del pasaporte en el correo o en la nube te ahorrará muchos problemas si lo pierdes.",
          "Save the emergency numbers: police 105, fire brigade 116 and ambulance (SAMU) 106. Keep your travel insurance and agency contacts handy; our team is available 24 hours a day during your trip. A digital copy of your passport in your email or cloud storage will save you a lot of trouble if you lose it.",
          "Guarde os números de emergência: polícia 105, bombeiros 116 e ambulância (SAMU) 106. Tenha à mão o contato do seu seguro de viagem e da sua agência; nossa equipe está disponível 24 horas durante a viagem. Uma cópia digital do passaporte no e-mail ou na nuvem poupa muitos problemas se você perdê-lo."
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
        heading: t("¿Necesito visa?", "Do I need a visa?", "Preciso de visto?"),
        body: t(
          "Los ciudadanos de la Unión Europea, Estados Unidos, Canadá, el Reino Unido y la mayoría de los países de Sudamérica entran al Perú como turistas sin visa. El tiempo de estancia lo decide el agente de migraciones a tu llegada, con un máximo de 183 días al año. Los requisitos cambian y algunos países sí necesitan visa, así que confírmalo siempre en la web oficial de Migraciones del Perú o en el consulado antes de comprar el vuelo.",
          "Citizens of the European Union, the United States, Canada, the United Kingdom and most South American countries enter Peru as tourists without a visa. The length of stay is set by the immigration officer on arrival, up to a maximum of 183 days a year. Requirements change and some countries do need a visa, so always confirm on the official website of Peru's immigration authority (Migraciones) or with the consulate before buying your flight.",
          "Cidadãos da União Europeia, dos Estados Unidos, do Canadá, do Reino Unido e da maioria dos países da América do Sul entram no Peru como turistas sem visto. O tempo de permanência é definido pelo agente de migração na chegada, com um máximo de 183 dias por ano. Os requisitos mudam e alguns países precisam de visto, então confirme sempre no site oficial de Migraciones do Peru ou no consulado antes de comprar a passagem."
        ),
      },
      {
        heading: t("Pasaporte o documento de identidad", "Passport or national ID", "Passaporte ou documento de identidade"),
        body: t(
          "La mayoría de viajeros necesita pasaporte vigente, y muchos países recomiendan que tenga al menos seis meses de validez. Los ciudadanos de varios países sudamericanos, como Brasil, Argentina, Chile, Colombia, Ecuador o Bolivia, pueden entrar con su documento nacional de identidad. Para Machu Picchu, el Camino Inca y los trenes, el documento con el que reservas debe ser el mismo que presentas.",
          "Most travellers need a valid passport, and many countries recommend at least six months' validity. Citizens of several South American countries, such as Brazil, Argentina, Chile, Colombia, Ecuador or Bolivia, can enter with their national ID card. For Machu Picchu, the Inca Trail and the trains, the document you book with must be the one you show.",
          "A maioria dos viajantes precisa de passaporte válido, e muitos países recomendam pelo menos seis meses de validade. Cidadãos de vários países sul-americanos, como Brasil, Argentina, Chile, Colômbia, Equador ou Bolívia, podem entrar com sua carteira de identidade. Para Machu Picchu, a Trilha Inca e os trens, o documento usado na reserva deve ser o mesmo apresentado."
        ),
      },
      {
        heading: t("Vacunas recomendadas", "Recommended vaccines", "Vacinas recomendadas"),
        body: t(
          "Para Cusco, Machu Picchu, Lima o Arequipa no se exige ninguna vacuna. Si vas a la Amazonía, se recomienda la vacuna contra la fiebre amarilla, al menos diez días antes del viaje. Consulta a tu médico o a un centro de medicina del viajero unas semanas antes: te dirá qué conviene según tu salud y tu ruta.",
          "No vaccine is required for Cusco, Machu Picchu, Lima or Arequipa. If you are going to the Amazon, the yellow fever vaccine is recommended at least ten days before travelling. See your doctor or a travel clinic a few weeks ahead: they will advise what is right for your health and route.",
          "Para Cusco, Machu Picchu, Lima ou Arequipa não se exige nenhuma vacina. Se for à Amazônia, recomenda-se a vacina contra a febre amarela, pelo menos dez dias antes da viagem. Consulte seu médico ou um centro de medicina do viajante algumas semanas antes: ele dirá o que convém conforme sua saúde e seu roteiro."
        ),
      },
      {
        heading: t("Seguro de viaje", "Travel insurance", "Seguro de viagem"),
        body: t(
          "Recomendamos un seguro con cobertura médica, evacuación, cancelación y actividades de aventura, sobre todo si vas a hacer trekking en altura o viajar a la selva. Revisa que cubra la altitud a la que vas a subir: algunas pólizas excluyen el trekking por encima de cierta altura.",
          "We recommend insurance with medical cover, evacuation, cancellation and adventure activities, especially if you plan to trek at altitude or travel to the rainforest. Check that it covers the altitude you will reach: some policies exclude trekking above a certain height.",
          "Recomendamos um seguro com cobertura médica, evacuação, cancelamento e atividades de aventura, sobretudo se for fazer trekking em altitude ou viajar à selva. Verifique se cobre a altitude que você vai alcançar: algumas apólices excluem trekking acima de certa altitude."
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
          "Sí. Recomendamos llegar uno o dos días antes de hacer trekking o visitar lugares más altos, como la Montaña de 7 Colores. Toma mate de coca, evita las comidas pesadas y el alcohol los primeros días y bebe mucha agua. Una buena idea es empezar por el Valle Sagrado, que está más bajo que Cusco.",
          "Yes. We recommend arriving one or two days before trekking or visiting higher places such as Rainbow Mountain. Drink coca tea, avoid heavy meals and alcohol for the first days and drink plenty of water. A good idea is to start with the Sacred Valley, which is lower than Cusco.",
          "Sim. Recomendamos chegar um ou dois dias antes de fazer trekking ou visitar lugares mais altos, como a Montanha das 7 Cores. Tome chá de coca, evite comidas pesadas e álcool nos primeiros dias e beba muita água. Uma boa ideia é começar pelo Vale Sagrado, que fica mais baixo que Cusco."
        ),
      },
      {
        heading: t("¿Cuántos días necesito para Cusco y Machu Picchu?", "How many days do I need for Cusco and Machu Picchu?", "Quantos dias preciso para Cusco e Machu Picchu?"),
        body: t(
          "Lo mínimo recomendable son cuatro días: uno para aclimatarte y conocer Cusco, uno para el Valle Sagrado y uno o dos para Machu Picchu. Con cinco o seis días puedes sumar la Montaña de 7 Colores, la laguna Humantay o Maras y Moray sin prisas.",
          "The recommended minimum is four days: one to acclimatise and see Cusco, one for the Sacred Valley and one or two for Machu Picchu. With five or six days you can add Rainbow Mountain, Humantay Lagoon or Maras and Moray without rushing.",
          "O mínimo recomendável são quatro dias: um para se aclimatar e conhecer Cusco, um para o Vale Sagrado e um ou dois para Machu Picchu. Com cinco ou seis dias dá para incluir a Montanha das 7 Cores, a Lagoa Humantay ou Maras e Moray sem pressa."
        ),
      },
      {
        heading: t("¿Con cuánta antelación debo reservar?", "How far ahead should I book?", "Com quanta antecedência devo reservar?"),
        body: t(
          "Para Machu Picchu en temporada alta (mayo a octubre), con uno o dos meses de antelación. El Camino Inca tiene cupos muy limitados y se agota con varios meses de anticipación. Para el resto de tours, unos días suelen bastar, aunque reservar antes te asegura las fechas que quieres.",
          "For Machu Picchu in high season (May to October), one or two months ahead. The Inca Trail has very limited permits and sells out several months in advance. For other tours, a few days is usually enough, though booking earlier secures the dates you want.",
          "Para Machu Picchu na alta temporada (maio a outubro), com um ou dois meses de antecedência. A Trilha Inca tem vagas muito limitadas e esgota com vários meses de antecedência. Para os demais tours, alguns dias costumam bastar, embora reservar antes garanta as datas que você quer."
        ),
      },
      {
        heading: t("¿Cómo hago la reserva?", "How do I book?", "Como faço a reserva?"),
        body: t(
          "Completa el formulario en la página del tour o escríbenos por WhatsApp. Confirmamos disponibilidad y cupos en menos de 24 horas, sin pagos en línea por ahora. Si tienes dudas sobre qué tour elegir, cuéntanos tus fechas y tus intereses y te proponemos un itinerario.",
          "Fill in the form on the tour page or message us on WhatsApp. We confirm availability within 24 hours, with no online payments for now. If you are unsure which tour to choose, tell us your dates and interests and we will suggest an itinerary.",
          "Preencha o formulário na página do tour ou escreva-nos pelo WhatsApp. Confirmamos disponibilidade em até 24 horas, sem pagamentos on-line por enquanto. Se tiver dúvidas sobre qual tour escolher, conte-nos suas datas e interesses e propomos um roteiro."
        ),
      },
      {
        heading: t("¿Incluyen entradas?", "Are entrance fees included?", "Os ingressos estão incluídos?"),
        body: t(
          "Cada tour indica qué incluye y qué no. Para Machu Picchu gestionamos tus boletos con anticipación según disponibilidad; las entradas son nominales y se piden con el pasaporte, así que necesitamos tus datos exactos al reservar.",
          "Each tour states what is and is not included. For Machu Picchu we arrange your tickets in advance according to availability; tickets are issued in your name and checked against your passport, so we need your exact details when booking.",
          "Cada tour informa o que inclui e o que não inclui. Para Machu Picchu providenciamos seus bilhetes com antecedência conforme disponibilidade; os ingressos são nominais e conferidos com o passaporte, por isso precisamos dos seus dados exatos ao reservar."
        ),
      },
      {
        heading: t("¿Qué pasa si llueve?", "What if it rains?", "E se chover?"),
        body: t(
          "La mayoría de tours se realizan con lluvia ligera, y Machu Picchu con nubes tiene su propio encanto. En caso de suspensión por seguridad, reprogramamos tu experiencia sin costo adicional.",
          "Most tours run in light rain, and Machu Picchu in the clouds has a charm of its own. If a tour is suspended for safety reasons, we reschedule your experience at no extra cost.",
          "A maioria dos tours acontece com chuva leve, e Machu Picchu com nuvens tem seu próprio encanto. Em caso de suspensão por segurança, remarcamos sua experiência sem custo adicional."
        ),
      },
      {
        heading: t("¿Qué moneda se usa? ¿Hay que dejar propina?", "Which currency is used? Should I tip?", "Qual moeda se usa? É preciso dar gorjeta?"),
        body: t(
          "La moneda es el sol peruano. En hoteles, restaurantes y tiendas de las ciudades se puede pagar con tarjeta, pero en mercados, pueblos y taxis se usa efectivo, mejor en billetes pequeños y en buen estado. La propina no es obligatoria; en restaurantes es habitual dejar alrededor de un 10 % y, si quedaste contento, también a guías y porteadores.",
          "The currency is the Peruvian sol. In city hotels, restaurants and shops you can pay by card, but markets, villages and taxis use cash, ideally small notes in good condition. Tipping is not compulsory; around 10% is customary in restaurants and, if you were happy, for guides and porters too.",
          "A moeda é o sol peruano. Em hotéis, restaurantes e lojas das cidades dá para pagar com cartão, mas em mercados, povoados e táxis se usa dinheiro, de preferência notas pequenas e em bom estado. A gorjeta não é obrigatória; em restaurantes é comum deixar cerca de 10% e, se ficou satisfeito, também para guias e carregadores."
        ),
      },
      {
        heading: t("¿Puedo viajar con niños o personas mayores?", "Can I travel with children or older people?", "Posso viajar com crianças ou pessoas idosas?"),
        body: t(
          "Sí. Machu Picchu, el Valle Sagrado, Cusco y el lago Titicaca se disfrutan a cualquier edad, con un ritmo tranquilo y tiempo para aclimatarse. Para los trekkings de varios días y los lugares por encima de 4500 metros conviene buena forma física. Cuéntanos quién viaja y adaptamos el itinerario.",
          "Yes. Machu Picchu, the Sacred Valley, Cusco and Lake Titicaca can be enjoyed at any age, at a gentle pace with time to acclimatise. Multi-day treks and places above 4,500 metres call for good fitness. Tell us who is travelling and we will adapt the itinerary.",
          "Sim. Machu Picchu, o Vale Sagrado, Cusco e o lago Titicaca podem ser aproveitados em qualquer idade, num ritmo tranquilo e com tempo para se aclimatar. Para os trekkings de vários dias e os lugares acima de 4.500 metros convém bom preparo físico. Conte-nos quem vai viajar e adaptamos o roteiro."
        ),
      },
    ],
  },
];
