import type { LocalizedText } from "@/types/tour";
import { empresa } from "@/config/empresa";
import { siteConfig, siteEmail } from "@/config/site";

/*
 * Política de privacidad y términos y condiciones.
 *
 * Sustituyen a unos textos de plantilla que no describían esta web: hablaban
 * del dominio «gotomapi.pe», de proveedores que no se usan (Vercel, Resend)
 * y de Google Analytics y Meta Pixel, que no están activos. Un documento
 * legal que describe otra web no protege a nadie, y ante una reclamación
 * juega en contra.
 *
 * Todo lo que aquí se afirma sale de cómo funciona el sitio: qué formularios
 * hay, qué se guarda y dónde, qué no se cobra en línea. Los datos de la
 * empresa vienen de `config/empresa`, los mismos que enseña «Nosotros».
 *
 * El español es el texto de referencia; las versiones en inglés y portugués
 * lo traducen y así lo dicen.
 */

export type BloqueLegal =
  | { tipo: "p"; texto: LocalizedText }
  | { tipo: "lista"; items: LocalizedText[] };

export interface SeccionLegal {
  id: string;
  /** Rótulo corto para el índice. */
  corto: LocalizedText;
  titulo: LocalizedText;
  bloques: BloqueLegal[];
}

export interface LegalDocument {
  badge: LocalizedText;
  title: LocalizedText;
  updated: LocalizedText;
  intro: LocalizedText;
  /** Lo esencial en cuatro frases, antes del texto completo. */
  resumen: LocalizedText[];
  sections: SeccionLegal[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });
const p = (es: string, en: string, pt: string): BloqueLegal => ({ tipo: "p", texto: t(es, en, pt) });
const lista = (...items: LocalizedText[]): BloqueLegal => ({ tipo: "lista", items });

const ACTUALIZADO = t(
  "Última actualización: 14 de septiembre de 2026",
  "Last updated: 14 September 2026",
  "Última atualização: 14 de setembro de 2026"
);

const TELEFONO = siteConfig.phone.display;
const DOMINIO = siteConfig.domain;
const { razonSocial, ruc, domicilio, ciudad } = empresa;

const IDENTIDAD = t(
  `${razonSocial}, con RUC ${ruc} y domicilio en ${domicilio}, que opera bajo la marca ${siteConfig.fullName}.`,
  `${razonSocial}, taxpayer number (RUC) ${ruc}, registered address ${domicilio}, trading as ${siteConfig.fullName}.`,
  `${razonSocial}, com RUC ${ruc} e endereço em ${domicilio}, que opera sob a marca ${siteConfig.fullName}.`
);

const CANALES = t(
  `por WhatsApp al ${TELEFONO} o por correo a ${siteEmail}`,
  `via WhatsApp at ${TELEFONO} or by email at ${siteEmail}`,
  `pelo WhatsApp ${TELEFONO} ou pelo e-mail ${siteEmail}`
);

const TRADUCCION = t(
  "",
  " This English version is a translation; in case of discrepancy, the Spanish version prevails.",
  " Esta versão em português é uma tradução; em caso de divergência, prevalece a versão em espanhol."
);

/* La analítica solo se menciona si está activa en esta compilación. Hoy no
   lo está: no hay identificadores de Google Analytics ni de Meta configurados
   en el despliegue. Si mañana se activan, la política lo dirá sola. */
const hayAnalitica = Boolean(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID);

// ═════════════════════════════════════════════════════════════════════════
//  POLÍTICA DE PRIVACIDAD
// ═════════════════════════════════════════════════════════════════════════

export const PRIVACY: LegalDocument = {
  badge: t("Legal", "Legal", "Legal"),
  title: t("Política de privacidad", "Privacy Policy", "Política de Privacidade"),
  updated: ACTUALIZADO,
  intro: t(
    `Cómo tratamos los datos personales que nos das al consultar o reservar un viaje en ${DOMINIO}, conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento.`,
    `How we handle the personal data you give us when you enquire about or book a trip on ${DOMINIO}, in accordance with Peruvian Law No. 29733 on Personal Data Protection and its regulations.${TRADUCCION.en}`,
    `Como tratamos os dados pessoais que você nos fornece ao consultar ou reservar uma viagem em ${DOMINIO}, conforme a Lei peruana N.° 29733 de Proteção de Dados Pessoais e seu regulamento.${TRADUCCION.pt}`
  ),
  resumen: [
    t(
      "Solo pedimos los datos necesarios para organizar tu viaje.",
      "We only ask for the data needed to organise your trip.",
      "Pedimos apenas os dados necessários para organizar sua viagem."
    ),
    t(
      "No cobramos en línea: nunca te pediremos datos de tarjeta en esta web.",
      "We take no online payments: this website will never ask for card details.",
      "Não cobramos on-line: este site nunca pedirá dados de cartão."
    ),
    t(
      "No vendemos tus datos ni los usamos para publicidad sin tu permiso.",
      "We do not sell your data or use it for advertising without your consent.",
      "Não vendemos seus dados nem os usamos para publicidade sem sua permissão."
    ),
    t(
      "Puedes pedir en cualquier momento que los veamos, corrijamos o borremos.",
      "You can ask us at any time to show, correct or delete them.",
      "Você pode pedir a qualquer momento que os mostremos, corrijamos ou apaguemos."
    ),
  ],
  sections: [
    {
      id: "responsable",
      corto: t("Responsable", "Controller", "Responsável"),
      titulo: t("Quién es responsable de tus datos", "Who is responsible for your data", "Quem é responsável pelos seus dados"),
      bloques: [
        { tipo: "p", texto: IDENTIDAD },
        p(
          `Para cualquier asunto sobre tus datos puedes escribirnos ${CANALES.es}.`,
          `For any matter concerning your data, contact us ${CANALES.en}.`,
          `Para qualquer assunto sobre seus dados, escreva-nos ${CANALES.pt}.`
        ),
      ],
    },
    {
      id: "datos",
      corto: t("Qué datos", "What data", "Quais dados"),
      titulo: t("Qué datos recogemos", "What data we collect", "Quais dados coletamos"),
      bloques: [
        p(
          "Al enviar una solicitud de reserva desde la web:",
          "When you send a booking request through the website:",
          "Ao enviar uma solicitação de reserva pelo site:"
        ),
        lista(
          t("Nombre completo y correo electrónico.", "Full name and email address.", "Nome completo e e-mail."),
          t("Número de WhatsApp, cuando el formulario lo pide.", "WhatsApp number, where the form asks for it.", "Número de WhatsApp, quando o formulário o solicita."),
          t("Tour o paquete, fecha preferida y número de viajeros.", "Tour or package, preferred date and number of travellers.", "Tour ou pacote, data preferida e número de viajantes."),
          t("El mensaje que quieras añadir y el idioma en que navegas.", "Any message you add and the language you browse in.", "A mensagem que quiser adicionar e o idioma em que navega.")
        ),
        p(
          "Durante la organización del viaje, y solo cuando hace falta para emitir entradas, boletos de tren o permisos a tu nombre: número de pasaporte o documento de identidad, nacionalidad y fecha de nacimiento. Las entradas a Machu Picchu, los trenes y los permisos del Camino Inca son nominativos y no pueden emitirse sin esos datos.",
          "While organising the trip, and only when needed to issue tickets, train tickets or permits in your name: passport or ID number, nationality and date of birth. Machu Picchu tickets, trains and Inca Trail permits are issued in the traveller's name and cannot be issued without this information.",
          "Durante a organização da viagem, e apenas quando necessário para emitir ingressos, passagens de trem ou licenças em seu nome: número do passaporte ou documento de identidade, nacionalidade e data de nascimento. Os ingressos para Machu Picchu, os trens e as licenças da Trilha Inca são nominais e não podem ser emitidos sem esses dados."
        ),
        p(
          "Si nos cuentas alergias, restricciones alimentarias o condiciones de salud —por ejemplo, para prepararte ante la altura—, las usamos solo para atenderte en el viaje. Son datos sensibles: no los compartimos más que con quien tenga que conocerlos para cuidarte, como el guía o el hotel.",
          "If you tell us about allergies, dietary restrictions or health conditions—for example, to prepare you for the altitude—we use them only to look after you during the trip. This is sensitive data: we share it only with those who need to know in order to look after you, such as the guide or the hotel.",
          "Se você nos contar sobre alergias, restrições alimentares ou condições de saúde —por exemplo, para se preparar para a altitude—, usamos esses dados apenas para atendê-lo na viagem. São dados sensíveis: só os compartilhamos com quem precisa conhecê-los para cuidar de você, como o guia ou o hotel."
        ),
        p(
          "No pedimos ni guardamos datos de tarjetas de pago: esta web no cobra en línea.",
          "We do not ask for or store payment card details: this website takes no online payments.",
          "Não pedimos nem armazenamos dados de cartões de pagamento: este site não cobra on-line."
        ),
      ],
    },
    {
      id: "finalidad",
      corto: t("Para qué", "Purpose", "Finalidade"),
      titulo: t("Para qué los usamos", "What we use them for", "Para que os usamos"),
      bloques: [
        lista(
          t("Responder a tu consulta y confirmar disponibilidad.", "To answer your enquiry and confirm availability.", "Responder à sua consulta e confirmar a disponibilidade."),
          t("Organizar el viaje: reservar servicios y emitir entradas, boletos y permisos.", "To organise the trip: book services and issue tickets and permits.", "Organizar a viagem: reservar serviços e emitir ingressos, passagens e licenças."),
          t("Avisarte de cambios antes y durante el viaje.", "To notify you of changes before and during the trip.", "Avisar sobre mudanças antes e durante a viagem."),
          t("Atender reclamos y cumplir obligaciones legales, contables y tributarias.", "To handle complaints and meet legal, accounting and tax obligations.", "Atender reclamações e cumprir obrigações legais, contábeis e tributárias.")
        ),
        p(
          "Tratamos tus datos porque nos los das al pedirnos un servicio y porque son necesarios para prestarlo. No los usamos para enviarte publicidad salvo que lo aceptes expresamente, y puedes retirar ese permiso cuando quieras.",
          "We process your data because you give it to us when requesting a service and because it is necessary to provide that service. We do not use it to send you advertising unless you expressly agree, and you may withdraw that consent at any time.",
          "Tratamos seus dados porque você os fornece ao solicitar um serviço e porque são necessários para prestá-lo. Não os usamos para enviar publicidade, salvo se você aceitar expressamente, e você pode retirar essa permissão quando quiser."
        ),
      ],
    },
    {
      id: "terceros",
      corto: t("Con quién", "Sharing", "Com quem"),
      titulo: t("Con quién los compartimos", "Who we share them with", "Com quem os compartilhamos"),
      bloques: [
        p(
          "No vendemos tus datos. Solo los compartimos con quien los necesita para que el viaje salga adelante:",
          "We do not sell your data. We share it only with those who need it for the trip to happen:",
          "Não vendemos seus dados. Só os compartilhamos com quem precisa deles para que a viagem aconteça:"
        ),
        lista(
          t(
            "Los proveedores del servicio que reservas: operadores locales, guías, hoteles, transporte y empresas ferroviarias.",
            "The providers of the service you book: local operators, guides, hotels, transport and rail companies.",
            "Os fornecedores do serviço que você reserva: operadores locais, guias, hotéis, transporte e empresas ferroviárias."
          ),
          t(
            "Las entidades que emiten entradas y permisos, como el Ministerio de Cultura para Machu Picchu y el Camino Inca.",
            "The bodies that issue tickets and permits, such as the Ministry of Culture for Machu Picchu and the Inca Trail.",
            "As entidades que emitem ingressos e licenças, como o Ministério da Cultura para Machu Picchu e a Trilha Inca."
          ),
          t(
            "Los servicios técnicos con los que funciona la web: Supabase, donde se guardan las solicitudes de reserva, y Namecheap, que aloja el sitio.",
            "The technical services that run the website: Supabase, where booking requests are stored, and Namecheap, which hosts the site.",
            "Os serviços técnicos com que o site funciona: Supabase, onde as solicitações de reserva são armazenadas, e Namecheap, que hospeda o site."
          ),
          t(
            "WhatsApp (Meta), cuando decides escribirnos por ese medio.",
            "WhatsApp (Meta), when you choose to contact us that way.",
            "WhatsApp (Meta), quando você decide nos escrever por esse meio."
          ),
          t(
            "Las autoridades, cuando la ley nos obligue.",
            "Public authorities, where required by law.",
            "As autoridades, quando a lei nos obrigar."
          )
        ),
        p(
          "Algunos de estos servicios técnicos tienen sus servidores fuera del Perú, por lo que tus datos pueden transferirse a otros países. Solo trabajamos con proveedores que aplican medidas de seguridad adecuadas.",
          "Some of these technical services have servers outside Peru, so your data may be transferred to other countries. We only work with providers that apply appropriate security measures.",
          "Alguns desses serviços técnicos têm servidores fora do Peru, por isso seus dados podem ser transferidos para outros países. Só trabalhamos com fornecedores que aplicam medidas de segurança adequadas."
        ),
      ],
    },
    {
      id: "conservacion",
      corto: t("Cuánto tiempo", "Retention", "Por quanto tempo"),
      titulo: t("Cuánto tiempo los guardamos", "How long we keep them", "Por quanto tempo os guardamos"),
      bloques: [
        p(
          "Guardamos tus datos el tiempo necesario para atender tu solicitud y prestar el servicio, y después el que exijan las obligaciones legales, contables y tributarias. Pasado ese plazo los eliminamos o los anonimizamos.",
          "We keep your data for as long as needed to handle your request and provide the service, and afterwards for as long as legal, accounting and tax obligations require. After that we delete or anonymise it.",
          "Guardamos seus dados pelo tempo necessário para atender sua solicitação e prestar o serviço e, depois, pelo tempo exigido pelas obrigações legais, contábeis e tributárias. Passado esse prazo, nós os eliminamos ou anonimizamos."
        ),
      ],
    },
    {
      id: "derechos",
      corto: t("Tus derechos", "Your rights", "Seus direitos"),
      titulo: t("Tus derechos", "Your rights", "Seus direitos"),
      bloques: [
        p(
          "Puedes, en cualquier momento:",
          "At any time you may:",
          "Você pode, a qualquer momento:"
        ),
        lista(
          t("Saber qué datos tuyos tenemos y cómo los usamos (acceso).", "Find out what data we hold about you and how we use it (access).", "Saber quais dados seus temos e como os usamos (acesso)."),
          t("Corregirlos si son inexactos (rectificación).", "Have it corrected if inaccurate (rectification).", "Corrigi-los se estiverem incorretos (retificação)."),
          t("Pedir que los borremos (cancelación).", "Ask us to delete it (erasure).", "Pedir que os apaguemos (cancelamento)."),
          t("Oponerte a un uso concreto (oposición).", "Object to a particular use (objection).", "Opor-se a um uso específico (oposição)."),
          t("Retirar el consentimiento que nos diste.", "Withdraw the consent you gave us.", "Retirar o consentimento que nos deu.")
        ),
        p(
          `Escríbenos ${CANALES.es} indicando qué pides y adjuntando una copia de tu documento de identidad, para comprobar que eres tú. Te responderemos dentro de los plazos que fija la normativa. Si no quedas conforme, puedes acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.`,
          `Contact us ${CANALES.en}, stating your request and attaching a copy of your ID so we can verify it is you. We will respond within the time limits set by law. If you are not satisfied, you may contact Peru's National Authority for Personal Data Protection (Ministry of Justice and Human Rights).`,
          `Escreva-nos ${CANALES.pt}, indicando o que pede e anexando uma cópia do seu documento de identidade, para confirmarmos que é você. Responderemos dentro dos prazos fixados pela legislação. Se não ficar satisfeito, pode recorrer à Autoridade Nacional de Proteção de Dados Pessoais do Ministério da Justiça e Direitos Humanos do Peru.`
        ),
      ],
    },
    {
      id: "menores",
      corto: t("Menores", "Minors", "Menores"),
      titulo: t("Menores de edad", "Minors", "Menores de idade"),
      bloques: [
        p(
          "Los viajes de menores los contratan sus padres, madres o tutores, que son quienes nos facilitan los datos del menor necesarios para el viaje.",
          "Trips for minors are booked by their parents or guardians, who provide us with the minor's data needed for the trip.",
          "As viagens de menores são contratadas por seus pais ou responsáveis, que nos fornecem os dados do menor necessários para a viagem."
        ),
      ],
    },
    {
      id: "seguridad",
      corto: t("Seguridad", "Security", "Segurança"),
      titulo: t("Cómo los protegemos", "How we protect them", "Como os protegemos"),
      bloques: [
        p(
          "La web funciona con conexión cifrada (HTTPS). Las solicitudes de reserva se guardan en una base de datos a la que solo accede el personal autorizado de la agencia, con usuario y contraseña propios.",
          "The website uses an encrypted connection (HTTPS). Booking requests are stored in a database accessible only to authorised agency staff, each with their own username and password.",
          "O site funciona com conexão criptografada (HTTPS). As solicitações de reserva são armazenadas em um banco de dados acessado apenas pela equipe autorizada da agência, com usuário e senha próprios."
        ),
      ],
    },
    {
      id: "navegador",
      corto: t("Cookies", "Cookies", "Cookies"),
      titulo: t("Cookies y almacenamiento en tu navegador", "Cookies and browser storage", "Cookies e armazenamento no navegador"),
      bloques: [
        hayAnalitica
          ? p(
              "Usamos herramientas de medición (Google Analytics y/o Meta Pixel) para saber cómo se usa la web. Instalan cookies en tu navegador, que puedes bloquear o borrar desde su configuración sin que la web deje de funcionar.",
              "We use measurement tools (Google Analytics and/or Meta Pixel) to understand how the website is used. They set cookies in your browser, which you can block or delete in your browser settings without affecting how the website works.",
              "Usamos ferramentas de medição (Google Analytics e/ou Meta Pixel) para saber como o site é usado. Elas instalam cookies no seu navegador, que você pode bloquear ou apagar nas configurações sem que o site deixe de funcionar."
            )
          : p(
              "Esta web no usa cookies de publicidad ni de seguimiento.",
              "This website does not use advertising or tracking cookies.",
              "Este site não usa cookies de publicidade nem de rastreamento."
            ),
        p(
          "Guarda en tu propio navegador dos datos que no nos llegan: la moneda en la que prefieres ver los precios y la lista de reservas que enviaste desde ese dispositivo, para que puedas consultarlas en «Mis reservas». Puedes borrarlos limpiando los datos del sitio en tu navegador.",
          "It stores two items in your own browser that are never sent to us: the currency you prefer to see prices in, and the list of bookings you sent from that device so you can check them under «My bookings». You can remove them by clearing the site data in your browser.",
          "Ele guarda no seu próprio navegador dois dados que não chegam até nós: a moeda em que prefere ver os preços e a lista de reservas que enviou desse dispositivo, para consultá-las em «Minhas reservas». Você pode apagá-los limpando os dados do site no navegador."
        ),
        p(
          "Algunas imágenes se sirven desde servicios externos, que al entregarlas reciben datos técnicos de la conexión, como la dirección IP.",
          "Some images are served from external services, which receive technical connection data, such as your IP address, when delivering them.",
          "Algumas imagens são servidas por serviços externos, que ao entregá-las recebem dados técnicos da conexão, como o endereço IP."
        ),
      ],
    },
    {
      id: "whatsapp",
      corto: t("WhatsApp", "WhatsApp", "WhatsApp"),
      titulo: t("Si nos escribes por WhatsApp", "If you contact us on WhatsApp", "Se nos escrever pelo WhatsApp"),
      bloques: [
        p(
          "Los botones de WhatsApp abren esa aplicación con un mensaje ya preparado. A partir de ahí la conversación pasa por los servicios de Meta y se rige también por su política de privacidad.",
          "The WhatsApp buttons open that app with a pre-filled message. From then on the conversation goes through Meta's services and is also governed by Meta's privacy policy.",
          "Os botões do WhatsApp abrem esse aplicativo com uma mensagem já preparada. A partir daí, a conversa passa pelos serviços da Meta e também se rege pela política de privacidade dela."
        ),
      ],
    },
    {
      id: "cambios",
      corto: t("Cambios", "Changes", "Alterações"),
      titulo: t("Cambios en esta política", "Changes to this policy", "Alterações nesta política"),
      bloques: [
        p(
          "Si cambiamos cómo tratamos tus datos, actualizaremos esta página y su fecha. Si el cambio es importante, te lo diremos antes de aplicarlo a los datos que ya tenemos.",
          "If we change how we handle your data, we will update this page and its date. If the change is significant, we will tell you before applying it to data we already hold.",
          "Se mudarmos a forma como tratamos seus dados, atualizaremos esta página e sua data. Se a mudança for importante, avisaremos antes de aplicá-la aos dados que já temos."
        ),
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════
//  TÉRMINOS Y CONDICIONES
// ═════════════════════════════════════════════════════════════════════════

export const TERMS: LegalDocument = {
  badge: t("Legal", "Legal", "Legal"),
  title: t("Términos y condiciones", "Terms and Conditions", "Termos e Condições"),
  updated: ACTUALIZADO,
  intro: t(
    `Las condiciones con las que reservas y viajas con ${siteConfig.fullName}, y las que rigen el uso de ${DOMINIO}.`,
    `The conditions under which you book and travel with ${siteConfig.fullName}, and those governing the use of ${DOMINIO}.${TRADUCCION.en}`,
    `As condições com que você reserva e viaja com a ${siteConfig.fullName} e as que regem o uso de ${DOMINIO}.${TRADUCCION.pt}`
  ),
  resumen: [
    t(
      "Enviar el formulario es una solicitud, no una compra: la reserva se confirma por escrito.",
      "Sending the form is a request, not a purchase: the booking is confirmed in writing.",
      "Enviar o formulário é uma solicitação, não uma compra: a reserva é confirmada por escrito."
    ),
    t(
      "No cobramos en línea. El pago se acuerda con nuestro equipo por canales oficiales.",
      "We take no online payments. Payment is arranged with our team through official channels.",
      "Não cobramos on-line. O pagamento é combinado com nossa equipe por canais oficiais."
    ),
    t(
      "Puedes cancelar sin costo hasta 48 horas antes, salvo gastos que ya no se recuperan.",
      "You can cancel free of charge up to 48 hours before, except for costs that can no longer be recovered.",
      "Você pode cancelar sem custo até 48 horas antes, salvo gastos que já não podem ser recuperados."
    ),
    t(
      "Las entradas a Machu Picchu, los trenes y los permisos van a tu nombre y no suelen ser reembolsables.",
      "Machu Picchu tickets, trains and permits are in your name and are usually non-refundable.",
      "Ingressos para Machu Picchu, trens e licenças são nominais e geralmente não são reembolsáveis."
    ),
  ],
  sections: [
    {
      id: "quienes",
      corto: t("Quiénes somos", "Who we are", "Quem somos"),
      titulo: t("Quiénes somos", "Who we are", "Quem somos"),
      bloques: [
        { tipo: "p", texto: IDENTIDAD },
        p(
          `Agencia de viajes y operador turístico con licencia de funcionamiento N.° ${empresa.licenciaFuncionamiento} y certificado de autorización N.° ${empresa.certificadoAutorizacion}.`,
          `Travel agency and tour operator holding operating licence No. ${empresa.licenciaFuncionamiento} and authorisation certificate No. ${empresa.certificadoAutorizacion}.`,
          `Agência de viagens e operadora turística com licença de funcionamento N.° ${empresa.licenciaFuncionamiento} e certificado de autorização N.° ${empresa.certificadoAutorizacion}.`
        ),
      ],
    },
    {
      id: "reservas",
      corto: t("Reservas", "Bookings", "Reservas"),
      titulo: t("Cómo se reserva", "How booking works", "Como funciona a reserva"),
      bloques: [
        lista(
          t(
            "Enviar el formulario o escribirnos por WhatsApp es una solicitud: todavía no hay reserva ni compromiso de pago.",
            "Sending the form or messaging us on WhatsApp is a request: there is no booking or payment commitment yet.",
            "Enviar o formulário ou nos escrever pelo WhatsApp é uma solicitação: ainda não há reserva nem compromisso de pagamento."
          ),
          t(
            "Te respondemos en menos de 24 horas confirmando disponibilidad, precio final y condiciones del servicio.",
            "We reply within 24 hours confirming availability, final price and the conditions of the service.",
            "Respondemos em menos de 24 horas confirmando disponibilidade, preço final e condições do serviço."
          ),
          t(
            "La reserva queda firme cuando la confirmamos por escrito, por WhatsApp o correo, y acordamos contigo el pago.",
            "The booking becomes firm once we confirm it in writing, by WhatsApp or email, and agree payment with you.",
            "A reserva fica confirmada quando a confirmamos por escrito, pelo WhatsApp ou e-mail, e combinamos o pagamento com você."
          )
        ),
        p(
          "Lo que diga esa confirmación —fechas, servicios incluidos, precio y condiciones— prevalece sobre la información general de la web.",
          "What that confirmation states—dates, included services, price and conditions—prevails over the general information on the website.",
          "O que essa confirmação disser —datas, serviços incluídos, preço e condições— prevalece sobre as informações gerais do site."
        ),
      ],
    },
    {
      id: "precios",
      corto: t("Precios y pagos", "Prices", "Preços"),
      titulo: t("Precios y pagos", "Prices and payment", "Preços e pagamentos"),
      bloques: [
        lista(
          t(
            "Los precios se publican en dólares estadounidenses (USD) y son por persona, salvo que se indique otra cosa.",
            "Prices are shown in US dollars (USD) and are per person unless stated otherwise.",
            "Os preços são publicados em dólares americanos (USD) e são por pessoa, salvo indicação em contrário."
          ),
          t(
            "Incluyen lo que figura en «¿Qué incluye?» de cada ficha. Lo que no aparece ahí no está incluido.",
            "They include what is listed under «What's included?» on each page. Anything not listed there is not included.",
            "Incluem o que aparece em «O que inclui?» de cada página. O que não aparece ali não está incluído."
          ),
          t(
            "Pueden variar según temporada y disponibilidad hasta que la reserva se confirma. Una vez confirmada, el precio no cambia.",
            "They may vary with season and availability until the booking is confirmed. Once confirmed, the price does not change.",
            "Podem variar conforme a temporada e a disponibilidade até a confirmação da reserva. Depois de confirmada, o preço não muda."
          ),
          t(
            "No cobramos en línea. El pago se coordina directamente con nuestro equipo.",
            "We take no online payments. Payment is arranged directly with our team.",
            "Não cobramos on-line. O pagamento é combinado diretamente com nossa equipe."
          )
        ),
        p(
          `Paga solo por los medios que te indiquemos desde nuestros canales oficiales —WhatsApp ${TELEFONO} y correo ${siteEmail}— y pide siempre tu comprobante. Si alguien te pide un pago en nuestro nombre por otro medio, consúltanos antes.`,
          `Only pay through the methods we give you from our official channels—WhatsApp ${TELEFONO} and email ${siteEmail}—and always ask for your receipt. If anyone asks you for payment in our name through any other channel, check with us first.`,
          `Pague apenas pelos meios que indicarmos em nossos canais oficiais —WhatsApp ${TELEFONO} e e-mail ${siteEmail}— e peça sempre o comprovante. Se alguém pedir um pagamento em nosso nome por outro meio, consulte-nos antes.`
        ),
      ],
    },
    {
      id: "entradas",
      corto: t("Entradas y permisos", "Tickets", "Ingressos"),
      titulo: t("Entradas, trenes y permisos", "Tickets, trains and permits", "Ingressos, trens e licenças"),
      bloques: [
        p(
          "Las entradas a Machu Picchu, los boletos de tren y los permisos del Camino Inca los emiten terceros —entidades públicas y empresas ferroviarias— con cupos limitados y según sus propias normas:",
          "Machu Picchu tickets, train tickets and Inca Trail permits are issued by third parties—public bodies and rail companies—with limited availability and under their own rules:",
          "Os ingressos para Machu Picchu, as passagens de trem e as licenças da Trilha Inca são emitidos por terceiros —órgãos públicos e empresas ferroviárias— com vagas limitadas e segundo suas próprias regras:"
        ),
        lista(
          t(
            "Son nominativos: se emiten con los datos de tu pasaporte o documento, que deben coincidir con el que lleves al viaje.",
            "They are issued in your name with your passport or ID details, which must match the document you travel with.",
            "São nominais: emitidos com os dados do seu passaporte ou documento, que devem coincidir com o que você levar na viagem."
          ),
          t(
            "Un error en los datos que nos facilitas puede impedir usarlos, y corregirlo puede no ser posible o tener costo.",
            "An error in the details you give us may make them unusable, and correcting it may not be possible or may have a cost.",
            "Um erro nos dados que você nos fornece pode impedir seu uso, e corrigi-lo pode não ser possível ou ter custo."
          ),
          t(
            "En general no son reembolsables ni transferibles, y sus horarios y circuitos los fijan quienes los emiten.",
            "They are generally non-refundable and non-transferable, and their schedules and routes are set by the issuers.",
            "Em geral não são reembolsáveis nem transferíveis, e seus horários e circuitos são definidos por quem os emite."
          )
        ),
      ],
    },
    {
      id: "cancelaciones",
      corto: t("Cancelaciones", "Cancellations", "Cancelamentos"),
      titulo: t("Cancelaciones y cambios", "Cancellations and changes", "Cancelamentos e alterações"),
      bloques: [
        p(
          "Si cancelas tú:",
          "If you cancel:",
          "Se você cancelar:"
        ),
        lista(
          t(
            "Hasta 48 horas antes del inicio del servicio, sin penalidad. Te devolvemos lo pagado menos los gastos que ya no se pueden recuperar, como entradas, boletos de tren, permisos o noches de hotel ya emitidos.",
            "Up to 48 hours before the service starts, without penalty. We refund what you paid, less any costs that can no longer be recovered, such as tickets, train tickets, permits or hotel nights already issued.",
            "Até 48 horas antes do início do serviço, sem multa. Devolvemos o valor pago, descontados os gastos que já não podem ser recuperados, como ingressos, passagens de trem, licenças ou diárias de hotel já emitidas."
          ),
          t(
            "Con menos de 48 horas, o si no te presentas, las condiciones concretas son las indicadas en la confirmación de tu reserva.",
            "With less than 48 hours' notice, or if you do not show up, the specific conditions are those stated in your booking confirmation.",
            "Com menos de 48 horas, ou se você não comparecer, as condições específicas são as indicadas na confirmação da sua reserva."
          ),
          t(
            `Pídelo siempre por escrito, ${CANALES.es}.`,
            `Always request it in writing, ${CANALES.en}.`,
            `Peça sempre por escrito, ${CANALES.pt}.`
          )
        ),
        p(
          "Si cancelamos nosotros por causas que dependen de la agencia, te ofrecemos otra fecha o servicio equivalente o te devolvemos el total pagado, a tu elección.",
          "If we cancel for reasons within the agency's control, we will offer you another date or an equivalent service, or refund the full amount paid, as you prefer.",
          "Se nós cancelarmos por motivos que dependem da agência, oferecemos outra data ou serviço equivalente ou devolvemos o total pago, à sua escolha."
        ),
        p(
          "Si el servicio no puede prestarse por causas ajenas a la agencia —mal tiempo, huaicos o deslizamientos, paros o bloqueos de vías, cierres ordenados por las autoridades—, buscaremos contigo otra fecha o una alternativa, y te devolveremos lo que podamos recuperar de los proveedores.",
          "If the service cannot be provided for reasons beyond the agency's control—bad weather, landslides, strikes or road blockades, closures ordered by the authorities—we will work with you to find another date or an alternative, and refund whatever we can recover from providers.",
          "Se o serviço não puder ser prestado por motivos alheios à agência —mau tempo, deslizamentos de terra, greves ou bloqueios de estradas, fechamentos ordenados pelas autoridades—, buscaremos com você outra data ou alternativa e devolveremos o que for possível recuperar dos fornecedores."
        ),
      ],
    },
    {
      id: "viajero",
      corto: t("Tu parte", "Your part", "Sua parte"),
      titulo: t("Lo que te corresponde como viajero", "Your responsibilities as a traveller", "O que cabe a você como viajante"),
      bloques: [
        lista(
          t("Llevar el pasaporte o documento vigente con el que se hizo la reserva.", "Carry the valid passport or ID used for the booking.", "Levar o passaporte ou documento válido usado na reserva."),
          t("Darnos datos correctos y avisarnos de cualquier cambio.", "Give us correct details and tell us about any change.", "Fornecer dados corretos e nos avisar de qualquer mudança."),
          t("Estar puntual en el punto y la hora de encuentro.", "Be on time at the meeting point and time.", "Chegar pontualmente ao ponto e horário de encontro."),
          t(
            "Informarnos de condiciones de salud relevantes. En la sierra se viaja a gran altura: consulta a tu médico si tienes dudas.",
            "Tell us about relevant health conditions. Travel in the Andes is at high altitude: consult your doctor if in doubt.",
            "Informar condições de saúde relevantes. Na serra se viaja em grande altitude: consulte seu médico se tiver dúvidas."
          ),
          t("Contar con un seguro de viaje, que te recomendamos.", "Have travel insurance, which we recommend.", "Ter um seguro-viagem, que recomendamos."),
          t(
            "Seguir las indicaciones del guía y las normas de los sitios arqueológicos y áreas naturales protegidas.",
            "Follow the guide's instructions and the rules of archaeological sites and protected natural areas.",
            "Seguir as orientações do guia e as normas dos sítios arqueológicos e áreas naturais protegidas."
          ),
          t("Los menores de edad viajan acompañados por un adulto responsable.", "Minors travel accompanied by a responsible adult.", "Menores de idade viajam acompanhados por um adulto responsável.")
        ),
      ],
    },
    {
      id: "responsabilidad",
      corto: t("Responsabilidad", "Liability", "Responsabilidade"),
      titulo: t("Nuestra responsabilidad", "Our liability", "Nossa responsabilidade"),
      bloques: [
        p(
          "Respondemos por la correcta prestación de los servicios que contratas con nosotros, con los derechos que te reconoce el Código de Protección y Defensa del Consumidor (Ley N.° 29571).",
          "We are responsible for the proper provision of the services you book with us, in line with your rights under Peru's Consumer Protection and Defence Code (Law No. 29571).",
          "Respondemos pela correta prestação dos serviços que você contrata conosco, com os direitos que lhe reconhece o Código de Proteção e Defesa do Consumidor do Peru (Lei N.° 29571)."
        ),
        p(
          "No respondemos por daños que resulten de no seguir las indicaciones del guía o las normas de los lugares visitados, de datos incorrectos que nos hayas facilitado, ni de hechos ajenos a la agencia descritos en «Cancelaciones y cambios».",
          "We are not liable for harm resulting from not following the guide's instructions or the rules of the places visited, from incorrect details you gave us, or from events beyond the agency's control described under «Cancellations and changes».",
          "Não respondemos por danos resultantes de não seguir as orientações do guia ou as normas dos locais visitados, de dados incorretos que você nos forneceu, nem de fatos alheios à agência descritos em «Cancelamentos e alterações»."
        ),
      ],
    },
    {
      id: "web",
      corto: t("La web", "Website", "O site"),
      titulo: t("Información de la web", "Website information", "Informações do site"),
      bloques: [
        p(
          "Las fotos son ilustrativas. Los itinerarios pueden ajustarse por seguridad, clima o disposición de las autoridades. Revisamos la información con cuidado, pero si hubiera un error, lo que vale es lo que confirmamos por escrito al reservar.",
          "Photos are illustrative. Itineraries may be adjusted for safety, weather or official decisions. We check the information carefully, but if there is an error, what applies is what we confirm in writing when you book.",
          "As fotos são ilustrativas. Os roteiros podem ser ajustados por segurança, clima ou determinação das autoridades. Revisamos as informações com cuidado, mas, se houver algum erro, vale o que confirmamos por escrito na reserva."
        ),
        p(
          `Los textos, fotografías, logotipos y diseño de ${DOMINIO} pertenecen a ${razonSocial} o se usan con permiso de sus autores, y no pueden reproducirse sin autorización.`,
          `The texts, photographs, logos and design of ${DOMINIO} belong to ${razonSocial} or are used with their authors' permission, and may not be reproduced without authorisation.`,
          `Os textos, fotografias, logotipos e o design de ${DOMINIO} pertencem à ${razonSocial} ou são usados com permissão de seus autores, e não podem ser reproduzidos sem autorização.`
        ),
      ],
    },
    {
      id: "reclamos",
      corto: t("Reclamos", "Complaints", "Reclamações"),
      titulo: t("Reclamos", "Complaints", "Reclamações"),
      bloques: [
        p(
          `Si algo no salió como esperabas, cuéntanoslo ${CANALES.es}: queremos resolverlo contigo. También puedes presentar un reclamo o una queja ante el INDECOPI.`,
          `If something did not go as you expected, tell us ${CANALES.en}: we want to resolve it with you. You may also file a complaint with INDECOPI, Peru's consumer protection authority.`,
          `Se algo não saiu como você esperava, conte-nos ${CANALES.pt}: queremos resolver com você. Você também pode apresentar uma reclamação ao INDECOPI, a autoridade peruana de defesa do consumidor.`
        ),
      ],
    },
    {
      id: "ley",
      corto: t("Ley aplicable", "Governing law", "Lei aplicável"),
      titulo: t("Ley aplicable y cambios", "Governing law and changes", "Lei aplicável e alterações"),
      bloques: [
        p(
          `Estos términos se rigen por las leyes del Perú. Las controversias se someten a los jueces de ${ciudad}, sin perjuicio de tu derecho a acudir al INDECOPI.`,
          `These terms are governed by the laws of Peru. Disputes are subject to the courts of ${ciudad}, without prejudice to your right to go to INDECOPI.`,
          `Estes termos são regidos pelas leis do Peru. As controvérsias são submetidas aos juízes de ${ciudad}, sem prejuízo do seu direito de recorrer ao INDECOPI.`
        ),
        p(
          "Podemos actualizar estos términos; los cambios no afectan a reservas ya confirmadas, que se rigen por las condiciones vigentes al confirmarlas.",
          "We may update these terms; changes do not affect bookings already confirmed, which are governed by the conditions in force when they were confirmed.",
          "Podemos atualizar estes termos; as alterações não afetam reservas já confirmadas, que se regem pelas condições vigentes quando foram confirmadas."
        ),
      ],
    },
  ],
};
