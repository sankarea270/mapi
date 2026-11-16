import type { LocalizedText } from "@/types/tour";
import type { LugarGuia, PreguntaGuia } from "@/components/guia/BloquesGuia";

/*
 * Guía de cada experiencia: qué es, dónde vivirla, consejos y preguntas.
 *
 * Por qué existe. Search Console (noviembre de 2026) tenía las páginas de
 * experiencias en «Rastreada: actualmente sin indexar» y «Descubierta:
 * actualmente sin indexar»: eran una foto, una frase de 80 caracteres y las
 * tarjetas de los tours, unas 40 palabras. Google no indexa una página que
 * no cuenta nada que no esté ya en otra.
 *
 * `nombre` y `resumen` NO sustituyen a los del panel: solo se usan en inglés
 * y portugués cuando el panel no tiene la traducción (hoy las seis
 * experiencias tienen en esos idiomas el texto en español). En cuanto se
 * traduzcan en el panel, manda el panel.
 *
 * Como en las guías de destino, nada de precios ni horarios que envejezcan.
 */

export interface GuiaExperiencia {
  nombre: LocalizedText;
  resumen: LocalizedText;
  intro: LocalizedText[];
  lugares: LugarGuia[];
  consejos: LocalizedText[];
  preguntas: PreguntaGuia[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

export const GUIAS_EXPERIENCIA: Record<string, GuiaExperiencia> = {
  "textileria-andina": {
    nombre: t("Textilería Andina", "Andean Weaving", "Tecelagem Andina"),
    resumen: t(
      "Conoce los telares de Pisac y Chinchero, donde los colores de los Andes cobran vida.",
      "Discover the looms of Pisac and Chinchero, where the colours of the Andes come to life.",
      "Conheça os teares de Pisac e Chinchero, onde as cores dos Andes ganham vida."
    ),
    intro: [
      t(
        "En los Andes se teje desde hace miles de años, y el tejido fue para los incas un bien más valioso que el oro. Hoy las comunidades del Valle Sagrado y del lago Titicaca siguen hilando a mano la lana de alpaca, llama y oveja, tiñéndola con plantas, minerales y cochinilla, y tejiendo en telares de cintura con diseños que pasan de madres a hijas.",
        "People in the Andes have been weaving for thousands of years, and for the Incas cloth was worth more than gold. Today communities in the Sacred Valley and around Lake Titicaca still spin alpaca, llama and sheep wool by hand, dye it with plants, minerals and cochineal, and weave on backstrap looms with designs handed down from mother to daughter.",
        "Nos Andes se tece há milhares de anos, e para os incas o tecido valia mais que o ouro. Hoje as comunidades do Vale Sagrado e do lago Titicaca continuam fiando à mão a lã de alpaca, lhama e ovelha, tingindo-a com plantas, minerais e cochonilha, e tecendo em teares de cintura com desenhos que passam de mães para filhas."
      ),
      t(
        "Cada pueblo tiene sus propios motivos y colores, que hablan de ríos, montañas, lagunas y de la vida en la comunidad. Ver el proceso completo —lavar la lana, hilarla, teñirla y tejerla— cambia la forma de mirar una manta o un chullo en el mercado.",
        "Each village has its own patterns and colours, telling of rivers, mountains, lakes and community life. Watching the whole process —washing, spinning, dyeing and weaving the wool— changes the way you look at a blanket or a chullo hat at the market.",
        "Cada povoado tem seus próprios motivos e cores, que falam de rios, montanhas, lagoas e da vida em comunidade. Ver o processo completo —lavar a lã, fiá-la, tingi-la e tecê-la— muda a forma de olhar uma manta ou um chullo no mercado."
      ),
    ],
    lugares: [
      {
        nombre: t("Chinchero", "Chinchero", "Chinchero"),
        texto: t(
          "Las tejedoras muestran cómo lavan la lana con una raíz que hace espuma, cómo la tiñen y cómo tejen, en un pueblo andino con iglesia colonial y vistas a los nevados.",
          "Local weavers show how they wash wool with a root that lathers, how they dye it and how they weave, in an Andean town with a colonial church and views of snowy peaks.",
          "As tecelãs mostram como lavam a lã com uma raiz que faz espuma, como a tingem e como tecem, num povoado andino com igreja colonial e vista para as montanhas nevadas."
        ),
        tour: "valle-sagrado-ollantaytambo",
      },
      {
        nombre: t("Mercado de Pisac", "Pisac market", "Mercado de Pisac"),
        texto: t(
          "Uno de los mercados de artesanía más conocidos del Valle Sagrado, con mantas, ponchos y tejidos de toda la región.",
          "One of the best-known craft markets in the Sacred Valley, with blankets, ponchos and textiles from all over the region.",
          "Um dos mercados de artesanato mais conhecidos do Vale Sagrado, com mantas, ponchos e tecidos de toda a região."
        ),
        tour: "valle-sagrado-pisac",
      },
      {
        nombre: t("Museos de Cusco", "Cusco's museums", "Museus de Cusco"),
        texto: t(
          "Tejidos incas y preincas que muestran hasta dónde llegó esta técnica, y talleres donde se ve trabajar a tejedores de distintas comunidades.",
          "Inca and pre-Inca textiles showing how far this craft was taken, and workshops where weavers from different communities can be seen at work.",
          "Tecidos incas e pré-incas que mostram até onde chegou essa técnica, e oficinas onde se vê o trabalho de tecelões de diferentes comunidades."
        ),
        tour: "cusco-museos",
      },
      {
        nombre: t("Isla Taquile", "Taquile Island", "Ilha Taquile"),
        texto: t(
          "En el lago Titicaca, una isla cuyo arte textil está reconocido por la UNESCO, donde los hombres tejen los chullos que indican su estado civil.",
          "On Lake Titicaca, an island whose textile art is recognised by UNESCO, where men knit the chullo hats that show their marital status.",
          "No lago Titicaca, uma ilha cuja arte têxtil é reconhecida pela UNESCO, onde os homens tecem os chullos que indicam seu estado civil."
        ),
        tour: "titicaca-taquile",
      },
    ],
    consejos: [
      t(
        "Si compras, hazlo en los centros de tejedoras o directamente a quien teje: el dinero llega a la comunidad y sabes lo que te llevas. Un tejido a mano tiene pequeñas irregularidades y lleva semanas de trabajo; por eso cuesta más que uno de máquina.",
        "If you buy, do so at weavers' centres or directly from the weaver: the money reaches the community and you know what you are getting. A hand-woven piece has small irregularities and takes weeks of work, which is why it costs more than a machine-made one.",
        "Se for comprar, faça isso nos centros de tecelãs ou diretamente com quem tece: o dinheiro chega à comunidade e você sabe o que está levando. Um tecido feito à mão tem pequenas irregularidades e leva semanas de trabalho; por isso custa mais que um de máquina."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cómo saber si una prenda es de alpaca de verdad?", "How can I tell if a garment is real alpaca?", "Como saber se uma peça é de alpaca de verdade?"),
        respuesta: t(
          "La alpaca es suave, algo fría al tacto al principio y no brilla como el acrílico. Desconfía de precios muy bajos y de las etiquetas «100 % alpaca» en puestos de recuerdos: en los centros de tejedoras te explican la diferencia.",
          "Alpaca is soft, slightly cool to the touch at first and does not shine like acrylic. Be wary of very low prices and '100% alpaca' labels at souvenir stalls: weavers' centres will explain the difference.",
          "A alpaca é macia, um pouco fria ao toque no começo e não brilha como o acrílico. Desconfie de preços muito baixos e de etiquetas «100% alpaca» em barracas de lembranças: nos centros de tecelãs explicam a diferença."
        ),
      },
      {
        pregunta: t("¿Se puede aprender a tejer?", "Can I learn to weave?", "Dá para aprender a tecer?"),
        respuesta: t(
          "Algunas comunidades ofrecen talleres cortos de hilado o tejido. Dinos al reservar si te interesa y lo incluimos en el recorrido del Valle Sagrado.",
          "Some communities offer short spinning or weaving workshops. Let us know when booking and we will add one to your Sacred Valley tour.",
          "Algumas comunidades oferecem oficinas curtas de fiação ou tecelagem. Avise-nos ao reservar e incluímos uma no roteiro do Vale Sagrado."
        ),
      },
      {
        pregunta: t("¿Qué significan los dibujos de los tejidos?", "What do the designs in the textiles mean?", "O que significam os desenhos dos tecidos?"),
        respuesta: t(
          "Cada comunidad tiene los suyos: representan ríos, lagunas, montañas, plantas, animales o momentos de la vida en el pueblo. Las tejedoras suelen contar con gusto qué dice cada uno.",
          "Each community has its own: they depict rivers, lakes, mountains, plants, animals or moments of village life. Weavers are usually happy to explain what each one says.",
          "Cada comunidade tem os seus: representam rios, lagoas, montanhas, plantas, animais ou momentos da vida no povoado. As tecelãs costumam contar com prazer o que cada um diz."
        ),
      },
    ],
  },

  "cocina-peruana": {
    nombre: t("Cocina Peruana", "Peruvian Cuisine", "Cozinha Peruana"),
    resumen: t(
      "Clases de cocina con chefs locales: ceviche, lomo saltado y los sabores de la tierra.",
      "Cooking classes with local chefs: ceviche, lomo saltado and the flavours of the land.",
      "Aulas de culinária com chefs locais: ceviche, lomo saltado e os sabores da terra."
    ),
    intro: [
      t(
        "La cocina peruana mezcla lo andino, lo español, lo africano, lo chino y lo japonés sobre una despensa enorme: miles de variedades de papa, maíces de todos los colores, ajíes, quinua, pescados del Pacífico y frutas de la selva. Por eso cada región tiene sus platos y cada mercado es un descubrimiento.",
        "Peruvian cuisine blends Andean, Spanish, African, Chinese and Japanese influences on top of an enormous larder: thousands of potato varieties, corn of every colour, chilli peppers, quinoa, Pacific fish and rainforest fruit. That is why each region has its own dishes and every market is a discovery.",
        "A cozinha peruana mistura o andino, o espanhol, o africano, o chinês e o japonês sobre uma despensa enorme: milhares de variedades de batata, milhos de todas as cores, pimentas, quinoa, peixes do Pacífico e frutas da selva. Por isso cada região tem seus pratos e cada mercado é uma descoberta."
      ),
      t(
        "La mejor forma de entenderla es con las manos: recorrer un mercado con alguien que conoce cada producto y después cocinar un ceviche, un lomo saltado o un pisco sour. En Cusco y en Lima hay clases y recorridos para todos los niveles, sin necesidad de saber cocinar.",
        "The best way to understand it is hands-on: walk a market with someone who knows every product and then cook a ceviche, a lomo saltado or a pisco sour. In Cusco and Lima there are classes and food tours for every level, no cooking experience needed.",
        "A melhor forma de entendê-la é com as mãos: percorrer um mercado com alguém que conhece cada produto e depois preparar um ceviche, um lomo saltado ou um pisco sour. Em Cusco e em Lima há aulas e passeios para todos os níveis, sem precisar saber cozinhar."
      ),
    ],
    lugares: [
      {
        nombre: t("Mercado de San Pedro, Cusco", "San Pedro Market, Cusco", "Mercado de San Pedro, Cusco"),
        texto: t(
          "El mercado central de Cusco: papas de colores, frutas de la selva, quesos, panes enormes y puestos de jugos y caldos donde comen los cusqueños.",
          "Cusco's central market: colourful potatoes, jungle fruit, cheeses, huge loaves and stalls of juices and broths where locals eat.",
          "O mercado central de Cusco: batatas coloridas, frutas da selva, queijos, pães enormes e barracas de sucos e caldos onde os cusquenhos comem."
        ),
        tour: "cusco-gastronomico",
      },
      {
        nombre: t("Clase de cocina en Cusco", "Cooking class in Cusco", "Aula de culinária em Cusco"),
        texto: t(
          "Con un cocinero local se preparan platos andinos y criollos y se aprende a hacer el pisco sour, para terminar comiendo lo que uno mismo ha cocinado.",
          "With a local cook you prepare Andean and Creole dishes and learn to make a pisco sour, then sit down to eat what you have cooked.",
          "Com um cozinheiro local se preparam pratos andinos e crioulos e se aprende a fazer o pisco sour, para terminar comendo o que você mesmo cozinhou."
        ),
        tour: "cusco-gastronomico",
      },
      {
        nombre: t("Lima, capital gastronómica", "Lima, food capital", "Lima, capital gastronômica"),
        texto: t(
          "Cevicherías, cocina nikkei y chifa, mercados de barrio y algunos de los restaurantes más reconocidos de Sudamérica.",
          "Cevicherías, Nikkei and Chifa cooking, neighbourhood markets and some of South America's most acclaimed restaurants.",
          "Cevicherias, cozinha nikkei e chifa, mercados de bairro e alguns dos restaurantes mais reconhecidos da América do Sul."
        ),
        tour: "lima-gastronomico",
      },
      {
        nombre: t("Pachamanca en el Valle Sagrado", "Pachamanca in the Sacred Valley", "Pachamanca no Vale Sagrado"),
        texto: t(
          "Carnes, papas y habas cocinadas bajo tierra con piedras calientes y hierbas andinas, una tradición de fiesta en las comunidades.",
          "Meat, potatoes and broad beans cooked underground with hot stones and Andean herbs, a festive tradition in local communities.",
          "Carnes, batatas e favas cozidas sob a terra com pedras quentes e ervas andinas, uma tradição de festa nas comunidades."
        ),
      },
    ],
    consejos: [
      t(
        "Los primeros días en la altura conviene comer ligero y beber mucha agua, siempre embotellada. Si tienes alguna alergia o eres vegetariano, dínoslo al reservar: la cocina peruana tiene muchas opciones sin carne, como la causa, el choclo con queso o los platos de quinua.",
        "In your first days at altitude it is best to eat light and drink plenty of water, always bottled. If you have an allergy or are vegetarian, tell us when booking: Peruvian food has many meat-free options, such as causa, corn with cheese or quinoa dishes.",
        "Nos primeiros dias na altitude convém comer leve e beber bastante água, sempre engarrafada. Se tiver alguma alergia ou for vegetariano, avise-nos ao reservar: a cozinha peruana tem muitas opções sem carne, como a causa, o milho com queijo ou os pratos de quinoa."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Qué platos hay que probar en el Perú?", "Which dishes should I try in Peru?", "Que pratos provar no Peru?"),
        respuesta: t(
          "El ceviche, el lomo saltado, el ají de gallina, la causa, los anticuchos y el rocoto relleno, y en los Andes, el chiri uchu de Cusco o una sopa de quinua. Para beber, chicha morada y pisco sour.",
          "Ceviche, lomo saltado, ají de gallina, causa, anticuchos and rocoto relleno, and in the Andes, Cusco's chiri uchu or a quinoa soup. To drink, chicha morada and pisco sour.",
          "O ceviche, o lomo saltado, o ají de gallina, a causa, os anticuchos e o rocoto relleno, e nos Andes, o chiri uchu de Cusco ou uma sopa de quinoa. Para beber, chicha morada e pisco sour."
        ),
      },
      {
        pregunta: t("¿Hace falta saber cocinar para la clase?", "Do I need to know how to cook for the class?", "É preciso saber cozinhar para a aula?"),
        respuesta: t(
          "No. Las clases están pensadas para cualquiera: el cocinero explica cada paso y prepara contigo platos sencillos de hacer en casa.",
          "No. The classes are designed for anyone: the cook explains every step and makes dishes with you that are easy to recreate at home.",
          "Não. As aulas são pensadas para qualquer pessoa: o cozinheiro explica cada passo e prepara com você pratos simples de fazer em casa."
        ),
      },
      {
        pregunta: t("¿Qué es el cuy?", "What is cuy?", "O que é o cuy?"),
        respuesta: t(
          "Es el cuy o conejillo de Indias, que en los Andes se cría y se come desde tiempos preincas, sobre todo en fiestas. Se sirve asado o frito; probarlo es opcional.",
          "It is guinea pig, raised and eaten in the Andes since pre-Inca times, especially at celebrations. It is served roasted or fried; trying it is entirely optional.",
          "É o porquinho-da-índia, criado e consumido nos Andes desde tempos pré-incas, sobretudo em festas. É servido assado ou frito; prová-lo é opcional."
        ),
      },
    ],
  },

  "ruta-del-pisco": {
    nombre: t("Ruta del Pisco", "Pisco Route", "Rota do Pisco"),
    resumen: t(
      "Degustaciones y bodegas artesanales para conocer la bebida bandera del Perú.",
      "Tastings and artisan distilleries to get to know Peru's national drink.",
      "Degustações e destilarias artesanais para conhecer a bebida símbolo do Peru."
    ),
    intro: [
      t(
        "El pisco es un aguardiente de uva que se elabora en los valles de la costa peruana desde la época virreinal. Se destila una sola vez, sin añadir agua ni dejarlo en madera, así que todo su sabor viene de la uva: hay piscos puros de una sola variedad, como la quebranta o la italia, acholados que mezclan varias y mostos verdes, más suaves.",
        "Pisco is a grape brandy made in the valleys of Peru's coast since colonial times. It is distilled only once, with no added water and no ageing in wood, so all its flavour comes from the grape: there are single-variety piscos, such as quebranta or italia, acholados that blend several, and the smoother mosto verde.",
        "O pisco é uma aguardente de uva produzida nos vales da costa peruana desde a época colonial. É destilado uma única vez, sem adicionar água nem envelhecer em madeira, então todo o seu sabor vem da uva: há piscos puros de uma só variedade, como a quebranta ou a italia, acholados que misturam várias e mostos verdes, mais suaves."
      ),
      t(
        "Conocerlo es parte de entender la cultura peruana: en bares de Lima, en bodegas artesanales donde todavía se pisa la uva y en catas donde se aprende a distinguir sus aromas. Y, por supuesto, en un pisco sour bien hecho.",
        "Getting to know it is part of understanding Peruvian culture: in Lima's bars, at artisan distilleries where grapes are still trodden by foot, and at tastings where you learn to tell its aromas apart. And, of course, in a well-made pisco sour.",
        "Conhecê-lo é parte de entender a cultura peruana: em bares de Lima, em destilarias artesanais onde a uva ainda é pisada e em degustações onde se aprende a distinguir seus aromas. E, claro, num pisco sour bem feito."
      ),
    ],
    lugares: [
      {
        nombre: t("Bares del centro de Lima", "Bars in central Lima", "Bares do centro de Lima"),
        texto: t(
          "Los bares tradicionales del centro histórico, donde se dice que nacieron algunos de los cócteles de pisco más famosos.",
          "The traditional bars of the historic centre, where some of the most famous pisco cocktails are said to have been born.",
          "Os bares tradicionais do centro histórico, onde dizem ter nascido alguns dos coquetéis de pisco mais famosos."
        ),
        tour: "city-tour-lima",
      },
      {
        nombre: t("Barranco y Miraflores", "Barranco and Miraflores", "Barranco e Miraflores"),
        texto: t(
          "Barras de coctelería y bares de barrio para probar el pisco sour, el chilcano y los piscos de distintas uvas frente al mar.",
          "Cocktail bars and neighbourhood haunts to try pisco sour, chilcano and piscos from different grapes by the sea.",
          "Bares de coquetelaria e de bairro para provar o pisco sour, o chilcano e piscos de diferentes uvas de frente para o mar."
        ),
        tour: "lima-barranco",
      },
      {
        nombre: t("Cata de pisco con cocina limeña", "Pisco tasting with Lima cuisine", "Degustação de pisco com cozinha limenha"),
        texto: t(
          "Un recorrido gastronómico que termina con una cata guiada: cómo se sirve, cómo se huele y qué diferencia a cada tipo.",
          "A food tour ending with a guided tasting: how it is served, how to nose it and what sets each type apart.",
          "Um roteiro gastronômico que termina com uma degustação guiada: como se serve, como se sente o aroma e o que diferencia cada tipo."
        ),
        tour: "lima-gastronomico",
      },
      {
        nombre: t("Bodegas de Ica", "Ica's distilleries", "Destilarias de Ica"),
        texto: t(
          "En el valle de Ica, al sur de Lima, bodegas familiares con alambiques de cobre y lagares de piedra donde se pisa la uva en la vendimia.",
          "In the Ica valley, south of Lima, family distilleries with copper stills and stone presses where grapes are trodden at harvest time.",
          "No vale de Ica, ao sul de Lima, destilarias familiares com alambiques de cobre e lagares de pedra onde a uva é pisada na vindima."
        ),
      },
    ],
    consejos: [
      t(
        "Si te coincide, la vendimia de Ica se celebra en marzo, con fiestas y uva pisada a pie. El primer sábado de febrero es el Día del Pisco Sour y en julio se celebra el Día del Pisco. En una cata, prueba primero los piscos puros y deja los mostos verdes y los aromáticos para el final.",
        "If your dates match, Ica's grape harvest festival takes place in March, with celebrations and grapes trodden by foot. The first Saturday in February is Pisco Sour Day and Pisco Day is celebrated in July. At a tasting, try the pure piscos first and leave the mosto verde and aromatic ones for last.",
        "Se coincidir, a vindima de Ica é celebrada em março, com festas e uva pisada a pé. O primeiro sábado de fevereiro é o Dia do Pisco Sour e em julho se celebra o Dia do Pisco. Numa degustação, prove primeiro os piscos puros e deixe os mostos verdes e os aromáticos para o final."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cómo se hace un pisco sour?", "How is a pisco sour made?", "Como se faz um pisco sour?"),
        respuesta: t(
          "Con pisco, jugo de limón, jarabe de goma y clara de huevo, batidos con hielo y servidos con unas gotas de amargo de angostura encima.",
          "With pisco, lime juice, sugar syrup and egg white, shaken with ice and served with a few drops of Angostura bitters on top.",
          "Com pisco, suco de limão, xarope de açúcar e clara de ovo, batidos com gelo e servidos com algumas gotas de angostura por cima."
        ),
      },
      {
        pregunta: t("¿Qué diferencia hay entre pisco puro, acholado y mosto verde?", "What is the difference between pure, acholado and mosto verde pisco?", "Qual a diferença entre pisco puro, acholado e mosto verde?"),
        respuesta: t(
          "El puro se hace con una sola variedad de uva; el acholado mezcla varias, y el mosto verde se destila antes de que el mosto termine de fermentar, por lo que resulta más suave y aromático.",
          "Pure pisco is made from a single grape variety; acholado blends several, and mosto verde is distilled before the grape must has finished fermenting, which makes it smoother and more aromatic.",
          "O puro é feito com uma só variedade de uva; o acholado mistura várias, e o mosto verde é destilado antes que o mosto termine de fermentar, por isso fica mais suave e aromático."
        ),
      },
      {
        pregunta: t("¿Hay opciones sin alcohol?", "Are there alcohol-free options?", "Há opções sem álcool?"),
        respuesta: t(
          "Sí. En los recorridos gastronómicos se pueden probar la chicha morada, los jugos de frutas peruanas y otras bebidas tradicionales en lugar de las catas.",
          "Yes. On food tours you can try chicha morada, Peruvian fruit juices and other traditional drinks instead of the tastings.",
          "Sim. Nos roteiros gastronômicos é possível provar a chicha morada, os sucos de frutas peruanas e outras bebidas tradicionais no lugar das degustações."
        ),
      },
    ],
  },

  "fotografia-de-viajes": {
    nombre: t("Fotografía de Viajes", "Travel Photography", "Fotografia de Viagem"),
    resumen: t(
      "Tours fotográficos guiados por profesionales: luces doradas y paisajes únicos.",
      "Photography tours led by professionals: golden light and unique landscapes.",
      "Tours fotográficos guiados por profissionais: luz dourada e paisagens únicas."
    ),
    intro: [
      t(
        "Pocos países ofrecen tanto a una cámara en tan poco espacio: calles coloniales sobre muros incas, terrazas agrícolas que dibujan las montañas, salineras blancas, mercados llenos de color y la ciudadela de Machu Picchu entre la niebla. La luz de los Andes, limpia y fuerte, hace el resto.",
        "Few countries offer a camera so much in so little space: colonial streets on Inca walls, farming terraces sculpting the mountains, white salt pans, markets bursting with colour and the citadel of Machu Picchu in the mist. The clean, strong Andean light does the rest.",
        "Poucos países oferecem tanto a uma câmera em tão pouco espaço: ruas coloniais sobre muros incas, terraços agrícolas desenhando as montanhas, salinas brancas, mercados cheios de cor e a cidadela de Machu Picchu entre a névoa. A luz dos Andes, limpa e forte, faz o resto."
      ),
      t(
        "Un tour fotográfico se organiza alrededor de la luz: se llega a cada lugar a la hora en que mejor se ve, con un guía que conoce los encuadres y el tiempo justo para hacer la foto sin prisas. Sirve tanto para quien viaja con una cámara profesional como para quien fotografía con el móvil.",
        "A photography tour is planned around the light: you reach each place at the time it looks best, with a guide who knows the angles and allows time to take the shot unhurried. It works as well for those travelling with a professional camera as for those shooting on a phone.",
        "Um tour fotográfico se organiza em torno da luz: chega-se a cada lugar na hora em que ele fica mais bonito, com um guia que conhece os enquadramentos e o tempo certo para fazer a foto sem pressa. Serve tanto para quem viaja com câmera profissional quanto para quem fotografa com o celular."
      ),
    ],
    lugares: [
      {
        nombre: t("Cusco a la hora dorada", "Cusco at golden hour", "Cusco na hora dourada"),
        texto: t(
          "Los tejados de San Blas, los miradores sobre la ciudad y los muros incas iluminados por el sol bajo de la tarde.",
          "The rooftops of San Blas, viewpoints over the city and Inca walls lit by the low afternoon sun.",
          "Os telhados de San Blas, os mirantes sobre a cidade e os muros incas iluminados pelo sol baixo da tarde."
        ),
        tour: "cusco-fotografico",
      },
      {
        nombre: t("Cusco de noche", "Cusco by night", "Cusco à noite"),
        texto: t(
          "La Plaza de Armas, la Catedral y las calles empedradas iluminadas, para fotografía nocturna con trípode o con el modo noche del móvil.",
          "The illuminated Plaza de Armas, Cathedral and cobbled streets, for night photography with a tripod or your phone's night mode.",
          "A Plaza de Armas, a Catedral e as ruas de pedra iluminadas, para fotografia noturna com tripé ou com o modo noturno do celular."
        ),
        tour: "cusco-nocturno",
      },
      {
        nombre: t("Salineras de Maras y Moray", "Maras salt pans and Moray", "Salinas de Maras e Moray"),
        texto: t(
          "Cientos de pozas de sal en la ladera de una montaña y los andenes circulares de Moray: dos de las imágenes más gráficas del Valle Sagrado.",
          "Hundreds of salt pools on a mountainside and the circular terraces of Moray: two of the most graphic images in the Sacred Valley.",
          "Centenas de poças de sal na encosta de uma montanha e os terraços circulares de Moray: duas das imagens mais gráficas do Vale Sagrado."
        ),
        tour: "salineras-maras-moray",
      },
      {
        nombre: t("Montaña de Colores", "Rainbow Mountain", "Montanha Colorida"),
        texto: t(
          "Franjas de minerales rojos, ocres y verdes a más de 5000 metros, con alpacas y nevados alrededor.",
          "Bands of red, ochre and green minerals above 5,000 metres, with alpacas and snowy peaks all around.",
          "Faixas de minerais vermelhos, ocres e verdes a mais de 5.000 metros, com alpacas e montanhas nevadas ao redor."
        ),
        tour: "rainbow-mountain",
      },
      {
        nombre: t("Machu Picchu entre la niebla", "Machu Picchu in the mist", "Machu Picchu entre a névoa"),
        texto: t(
          "A primera hora la niebla sube del valle y descubre poco a poco la ciudadela: la foto que todos imaginan, y que cambia cada minuto.",
          "Early in the morning the mist rises from the valley and slowly reveals the citadel: the photo everyone imagines, changing by the minute.",
          "Logo cedo a névoa sobe do vale e revela pouco a pouco a cidadela: a foto que todos imaginam, e que muda a cada minuto."
        ),
        tour: "machu-picchu-clasico",
      },
    ],
    consejos: [
      t(
        "Pide permiso antes de fotografiar a las personas, sobre todo en los mercados y las comunidades. Con el frío de la altura las baterías duran menos, así que lleva una de repuesto en un bolsillo interior. En Machu Picchu no se permiten trípodes ni drones.",
        "Ask permission before photographing people, especially at markets and in communities. Batteries drain faster in the cold at altitude, so keep a spare in an inside pocket. Tripods and drones are not allowed at Machu Picchu.",
        "Peça permissão antes de fotografar as pessoas, sobretudo nos mercados e nas comunidades. Com o frio da altitude as baterias duram menos, então leve uma de reserva num bolso interno. Em Machu Picchu não são permitidos tripés nem drones."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Se puede volar un dron en Machu Picchu?", "Can I fly a drone at Machu Picchu?", "Posso voar um drone em Machu Picchu?"),
        respuesta: t(
          "No. Está prohibido volar drones en Machu Picchu y en los sitios arqueológicos sin un permiso especial del Ministerio de Cultura. En otros paisajes sí se puede, respetando las normas locales.",
          "No. Flying drones at Machu Picchu and other archaeological sites is forbidden without a special permit from the Ministry of Culture. Elsewhere it is possible, following local rules.",
          "Não. É proibido voar drones em Machu Picchu e nos sítios arqueológicos sem uma permissão especial do Ministério da Cultura. Em outras paisagens é possível, respeitando as normas locais."
        ),
      },
      {
        pregunta: t("¿Cuál es la mejor época para fotografiar los Andes?", "When is the best time to photograph the Andes?", "Qual a melhor época para fotografar os Andes?"),
        respuesta: t(
          "De mayo a septiembre hay cielos despejados y nevados nítidos. En la época de lluvias, de diciembre a marzo, el paisaje está verde y las nubes dan fotos más dramáticas, aunque con menos días de sol.",
          "From May to September skies are clear and the snowy peaks sharp. In the rainy season, December to March, the landscape is green and the clouds make for more dramatic photos, though with fewer sunny days.",
          "De maio a setembro o céu fica limpo e as montanhas nevadas nítidas. Na época de chuvas, de dezembro a março, a paisagem fica verde e as nuvens rendem fotos mais dramáticas, embora com menos dias de sol."
        ),
      },
      {
        pregunta: t("¿Hace falta una cámara profesional?", "Do I need a professional camera?", "É preciso uma câmera profissional?"),
        respuesta: t(
          "No. El guía adapta los consejos a lo que lleves, sea una cámara réflex, una compacta o el móvil. Lo que más cuenta es estar en el sitio a la hora buena.",
          "No. The guide adapts the tips to whatever you carry, be it a DSLR, a compact or a phone. What matters most is being in the right place at the right time.",
          "Não. O guia adapta as dicas ao que você levar, seja uma câmera réflex, uma compacta ou o celular. O que mais conta é estar no lugar na hora certa."
        ),
      },
    ],
  },

  astroturismo: {
    nombre: t("Astroturismo", "Stargazing", "Astroturismo"),
    resumen: t(
      "Cielos andinos sin contaminación lumínica: observa la Vía Láctea desde los Andes.",
      "Andean skies free of light pollution: watch the Milky Way from the Andes.",
      "Céus andinos sem poluição luminosa: observe a Via Láctea a partir dos Andes."
    ),
    intro: [
      t(
        "Los Andes tienen algunos de los mejores cielos del mundo para mirar las estrellas: la altura, el aire seco y la falta de luces dejan ver la Vía Láctea a simple vista, la Cruz del Sur y las Nubes de Magallanes, que solo se ven desde el hemisferio sur.",
        "The Andes have some of the best skies in the world for stargazing: altitude, dry air and the absence of lights reveal the Milky Way to the naked eye, along with the Southern Cross and the Magellanic Clouds, visible only from the southern hemisphere.",
        "Os Andes têm alguns dos melhores céus do mundo para observar as estrelas: a altitude, o ar seco e a falta de luzes deixam ver a Via Láctea a olho nu, o Cruzeiro do Sul e as Nuvens de Magalhães, que só se veem do hemisfério sul."
      ),
      t(
        "Los incas miraban el cielo de otra manera: además de las estrellas, veían figuras en las manchas oscuras de la Vía Láctea, a la que llamaban Mayu, el río. La llama, la serpiente o el sapo marcaban el calendario agrícola. Una noche en el Valle Sagrado o en un campamento de trekking es la mejor forma de verlas.",
        "The Incas read the sky differently: as well as stars, they saw figures in the dark patches of the Milky Way, which they called Mayu, the river. The llama, the serpent and the toad marked the farming calendar. A night in the Sacred Valley or at a trekking camp is the best way to see them.",
        "Os incas olhavam o céu de outro jeito: além das estrelas, viam figuras nas manchas escuras da Via Láctea, que chamavam de Mayu, o rio. A lhama, a serpente e o sapo marcavam o calendário agrícola. Uma noite no Vale Sagrado ou num acampamento de trekking é a melhor forma de vê-las."
      ),
    ],
    lugares: [
      {
        nombre: t("Noche en el Valle Sagrado", "A night in the Sacred Valley", "Noite no Vale Sagrado"),
        texto: t(
          "Lejos de las luces de Cusco, el valle ofrece cielos muy oscuros para una observación con guía después de cenar.",
          "Far from the lights of Cusco, the valley offers very dark skies for a guided session after dinner.",
          "Longe das luzes de Cusco, o vale oferece céus muito escuros para uma observação com guia depois do jantar."
        ),
        tour: "valle-sagrado-2dias",
      },
      {
        nombre: t("Campamentos del Salkantay", "Salkantay trek camps", "Acampamentos do Salkantay"),
        texto: t(
          "Dormir a casi 4000 metros, al pie de un nevado, con un cielo en el que se cuentan miles de estrellas.",
          "Sleeping at nearly 4,000 metres at the foot of a snow peak, under a sky with thousands of stars.",
          "Dormir a quase 4.000 metros, ao pé de uma montanha nevada, sob um céu com milhares de estrelas."
        ),
        tour: "salkantay-trek",
      },
      {
        nombre: t("Ausangate", "Ausangate", "Ausangate"),
        texto: t(
          "Uno de los trekkings más altos de la región, con noches por encima de los 4000 metros y cielos de una claridad extraordinaria.",
          "One of the region's highest treks, with nights above 4,000 metres and exceptionally clear skies.",
          "Um dos trekkings mais altos da região, com noites acima dos 4.000 metros e céus de uma claridade extraordinária."
        ),
        tour: "ausangate-trek",
      },
      {
        nombre: t("Camino Inca", "Inca Trail", "Trilha Inca"),
        texto: t(
          "Las noches de campamento en el camino que los incas recorrían hacia Machu Picchu, guiados también por las estrellas.",
          "Camping nights on the trail the Incas walked to Machu Picchu, guided by the stars as well.",
          "As noites de acampamento no caminho que os incas percorriam até Machu Picchu, guiados também pelas estrelas."
        ),
        tour: "camino-inca-clasico",
      },
    ],
    consejos: [
      t(
        "Elige fechas cerca de la luna nueva: con luna llena se ven muchas menos estrellas. Abrígate como para la noche más fría que imagines, porque en la altura la temperatura baja de cero en invierno. No hace falta telescopio; unos prismáticos ayudan y, para fotografiar la Vía Láctea, basta un trípode y una exposición larga.",
        "Pick dates close to the new moon: with a full moon far fewer stars are visible. Dress for the coldest night you can imagine, as temperatures at altitude drop below freezing in winter. You do not need a telescope; binoculars help and, to photograph the Milky Way, a tripod and a long exposure are enough.",
        "Escolha datas perto da lua nova: com lua cheia se veem muito menos estrelas. Agasalhe-se como para a noite mais fria que imaginar, porque na altitude a temperatura fica abaixo de zero no inverno. Não é preciso telescópio; um binóculo ajuda e, para fotografar a Via Láctea, bastam um tripé e uma exposição longa."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Cuál es la mejor época para ver las estrellas?", "When is the best time for stargazing?", "Qual a melhor época para ver as estrelas?"),
        respuesta: t(
          "De mayo a septiembre, la temporada seca: casi no hay nubes y el centro de la Vía Láctea pasa justo por encima de la cabeza. En la época de lluvias hay noches claras, pero son menos.",
          "From May to September, the dry season: there are hardly any clouds and the centre of the Milky Way passes right overhead. The rainy season has clear nights too, just fewer of them.",
          "De maio a setembro, a estação seca: quase não há nuvens e o centro da Via Láctea passa bem acima da cabeça. Na época de chuvas há noites limpas, mas são menos."
        ),
      },
      {
        pregunta: t("¿Hace falta un telescopio?", "Do I need a telescope?", "É preciso um telescópio?"),
        respuesta: t(
          "No. A simple vista se ven la Vía Láctea, las constelaciones andinas y los planetas. Unos prismáticos permiten ver cúmulos de estrellas y los cráteres de la luna.",
          "No. The Milky Way, the Andean constellations and the planets are all visible to the naked eye. Binoculars bring out star clusters and the craters of the moon.",
          "Não. A olho nu se veem a Via Láctea, as constelações andinas e os planetas. Um binóculo permite ver aglomerados de estrelas e as crateras da lua."
        ),
      },
      {
        pregunta: t("¿Qué son las constelaciones oscuras de los incas?", "What are the Incas' dark constellations?", "O que são as constelações escuras dos incas?"),
        respuesta: t(
          "Figuras que los incas veían en las nubes de polvo oscuro de la Vía Láctea, como una llama con su cría, una serpiente o un sapo. Su aparición en el cielo marcaba momentos del año agrícola.",
          "Figures the Incas saw in the dark dust clouds of the Milky Way, such as a llama with her young, a serpent or a toad. Their appearance in the sky marked moments in the farming year.",
          "Figuras que os incas viam nas nuvens de poeira escura da Via Láctea, como uma lhama com seu filhote, uma serpente ou um sapo. Seu aparecimento no céu marcava momentos do ano agrícola."
        ),
      },
    ],
  },

  "festivales-y-fiestas": {
    nombre: t("Festivales y Fiestas", "Festivals and Celebrations", "Festivais e Festas"),
    resumen: t(
      "Inti Raymi, fiestas patronales y celebraciones andinas con comunidades locales.",
      "Inti Raymi, patron-saint festivals and Andean celebrations with local communities.",
      "Inti Raymi, festas padroeiras e celebrações andinas com comunidades locais."
    ),
    intro: [
      t(
        "En el Perú casi siempre hay una fiesta en algún pueblo. Son celebraciones en las que se mezclan los ritos andinos y el calendario católico: procesiones, danzas con máscaras y trajes bordados, bandas de música que tocan durante días y comidas que se preparan solo para la ocasión.",
        "In Peru there is almost always a festival in some town. They are celebrations that blend Andean rites with the Catholic calendar: processions, dances with masks and embroidered costumes, bands that play for days and food prepared only for the occasion.",
        "No Peru quase sempre há uma festa em algum povoado. São celebrações que misturam os ritos andinos e o calendário católico: procissões, danças com máscaras e trajes bordados, bandas que tocam durante dias e comidas preparadas só para a ocasião."
      ),
      t(
        "Vivir una de ellas es la forma más directa de ver la cultura andina tal como es hoy. Algunas, como el Inti Raymi en Cusco o la Candelaria en Puno, reúnen a miles de personas; otras son fiestas de comunidad a las que se llega con un guía local.",
        "Experiencing one is the most direct way to see Andean culture as it is today. Some, like Inti Raymi in Cusco or Candelaria in Puno, draw thousands of people; others are community celebrations best reached with a local guide.",
        "Viver uma delas é a forma mais direta de ver a cultura andina como ela é hoje. Algumas, como o Inti Raymi em Cusco ou a Candelaria em Puno, reúnem milhares de pessoas; outras são festas de comunidade às quais se chega com um guia local."
      ),
    ],
    lugares: [
      {
        nombre: t("Inti Raymi, Cusco (24 de junio)", "Inti Raymi, Cusco (24 June)", "Inti Raymi, Cusco (24 de junho)"),
        texto: t(
          "La fiesta del Sol de los incas, recreada cada 24 de junio en el Qorikancha, la Plaza de Armas y la explanada de Sacsayhuamán.",
          "The Incas' festival of the Sun, re-enacted every 24 June at Qorikancha, the Plaza de Armas and the esplanade of Sacsayhuamán.",
          "A festa do Sol dos incas, recriada todo 24 de junho no Qorikancha, na Plaza de Armas e na esplanada de Sacsayhuamán."
        ),
      },
      {
        nombre: t("Corpus Christi y Qoyllur Rit'i", "Corpus Christi and Qoyllur Rit'i", "Corpus Christi e Qoyllur Rit'i"),
        texto: t(
          "En mayo o junio, según el año: los santos de las parroquias recorren Cusco en procesión, y miles de peregrinos suben al santuario de Qoyllur Rit'i, junto a un glaciar.",
          "In May or June, depending on the year: parish saints parade through Cusco, and thousands of pilgrims climb to the Qoyllur Rit'i sanctuary beside a glacier.",
          "Em maio ou junho, conforme o ano: os santos das paróquias percorrem Cusco em procissão, e milhares de peregrinos sobem ao santuário de Qoyllur Rit'i, junto a uma geleira."
        ),
      },
      {
        nombre: t("Virgen de la Candelaria, Puno (febrero)", "Virgen de la Candelaria, Puno (February)", "Virgen de la Candelaria, Puno (fevereiro)"),
        texto: t(
          "Una de las mayores fiestas de Sudamérica, Patrimonio Cultural Inmaterial de la Humanidad: miles de danzantes y músicos llenan Puno durante días.",
          "One of South America's biggest festivals, part of UNESCO's Intangible Cultural Heritage: thousands of dancers and musicians fill Puno for days.",
          "Uma das maiores festas da América do Sul, Patrimônio Cultural Imaterial da Humanidade: milhares de dançarinos e músicos enchem Puno durante dias."
        ),
        tour: "titicaca-2d",
      },
      {
        nombre: t("Fiestas en las islas del Titicaca", "Festivals on the Titicaca islands", "Festas nas ilhas do Titicaca"),
        texto: t(
          "En Amantaní y Taquile las celebraciones se viven en comunidad, con música, danzas y comida compartida con las familias que acogen a los viajeros.",
          "On Amantaní and Taquile celebrations are shared by the whole community, with music, dancing and food with the families who host travellers.",
          "Em Amantaní e Taquile as celebrações são vividas em comunidade, com música, danças e comida compartilhada com as famílias que recebem os viajantes."
        ),
        tour: "amantani",
      },
      {
        nombre: t("Virgen del Carmen, Paucartambo (julio)", "Virgen del Carmen, Paucartambo (July)", "Virgen del Carmen, Paucartambo (julho)"),
        texto: t(
          "A mediados de julio este pueblo colonial, camino del Manu, se llena de comparsas con máscaras que bailan durante varios días.",
          "In mid-July this colonial town on the road to Manu fills with masked dance troupes performing for several days.",
          "Em meados de julho este povoado colonial, a caminho do Manu, se enche de grupos mascarados que dançam durante vários dias."
        ),
      },
    ],
    consejos: [
      t(
        "En las grandes fiestas los hoteles y los trenes se llenan y suben de precio: reserva con meses de antelación. Son celebraciones religiosas y de comunidad, así que observa con respeto, pide permiso antes de fotografiar de cerca y sigue las indicaciones del guía.",
        "During the big festivals hotels and trains fill up and prices rise: book months ahead. These are religious and community celebrations, so watch respectfully, ask before taking close-up photos and follow your guide's advice.",
        "Nas grandes festas os hotéis e os trens lotam e os preços sobem: reserve com meses de antecedência. São celebrações religiosas e comunitárias, então observe com respeito, peça permissão antes de fotografar de perto e siga as orientações do guia."
      ),
    ],
    preguntas: [
      {
        pregunta: t("¿Hace falta entrada para el Inti Raymi?", "Do I need a ticket for Inti Raymi?", "É preciso ingresso para o Inti Raymi?"),
        respuesta: t(
          "Para las gradas de la ceremonia central en Sacsayhuamán, sí, y se agotan con antelación. Las escenas en el Qorikancha y la Plaza de Armas, y la explanada alta de Sacsayhuamán, se pueden ver sin entrada.",
          "For the stands at the main ceremony in Sacsayhuamán, yes, and they sell out early. The scenes at Qorikancha and the Plaza de Armas, and the upper slopes of Sacsayhuamán, can be watched without a ticket.",
          "Para as arquibancadas da cerimônia central em Sacsayhuamán, sim, e esgotam com antecedência. As cenas no Qorikancha e na Plaza de Armas, e a parte alta de Sacsayhuamán, podem ser vistas sem ingresso."
        ),
      },
      {
        pregunta: t("¿Cuándo hay fiestas en Cusco?", "When are the festivals in Cusco?", "Quando há festas em Cusco?"),
        respuesta: t(
          "Junio es el mes grande: Corpus Christi, Qoyllur Rit'i y el Inti Raymi. Hay celebraciones también en Semana Santa, con el Señor de los Temblores, en los carnavales de febrero y en las fiestas patronales de cada pueblo a lo largo del año.",
          "June is the big month: Corpus Christi, Qoyllur Rit'i and Inti Raymi. There are also celebrations at Easter, with the Señor de los Temblores, during the February carnivals and at each town's patron-saint festival throughout the year.",
          "Junho é o grande mês: Corpus Christi, Qoyllur Rit'i e o Inti Raymi. Também há celebrações na Semana Santa, com o Señor de los Temblores, nos carnavais de fevereiro e nas festas padroeiras de cada povoado ao longo do ano."
        ),
      },
      {
        pregunta: t("¿Se puede participar en las fiestas?", "Can visitors take part in the festivals?", "Dá para participar das festas?"),
        respuesta: t(
          "Como espectador, siempre, y a veces te invitarán a bailar o a compartir la comida. Con un guía local es más fácil entender qué se celebra y saber cuándo es bienvenido unirse.",
          "As a spectator, always, and sometimes you will be invited to dance or share food. With a local guide it is easier to understand what is being celebrated and when joining in is welcome.",
          "Como espectador, sempre, e às vezes vão convidar você para dançar ou compartilhar a comida. Com um guia local é mais fácil entender o que se celebra e saber quando é bem-vindo participar."
        ),
      },
    ],
  },
};

/**
 * El texto del panel en ese idioma; si el panel no lo tiene traducido (vacío
 * o idéntico al español), el de la guía. En español manda siempre el panel.
 */
export function traducidoOGuia(
  panel: LocalizedText,
  guia: LocalizedText | undefined,
  locale: string
): string {
  const propio = panel[locale as keyof LocalizedText]?.trim();
  if (locale === "es" || !guia || (propio && propio !== panel.es.trim())) {
    return propio || panel.es;
  }
  return guia[locale as keyof LocalizedText] || panel.es;
}
