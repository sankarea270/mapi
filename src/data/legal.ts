import type { LocalizedText } from "@/types/tour";

export interface LegalSection {
  heading: LocalizedText;
  body: LocalizedText;
}

export interface LegalDocument {
  badge: LocalizedText;
  title: LocalizedText;
  updated: LocalizedText;
  intro: LocalizedText;
  sections: LegalSection[];
}

const t = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

export const TERMS: LegalDocument = {
  badge: t("Legal", "Legal", "Legal"),
  title: t("Términos y condiciones", "Terms and Conditions", "Termos e Condições"),
  updated: t(
    "Última actualización: agosto de 2026",
    "Last updated: August 2026",
    "Última atualização: agosto de 2026"
  ),
  intro: t(
    "Estos términos regulan el uso de gotomapi.pe y la contratación de los servicios de GoToMapi.",
    "These terms govern the use of gotomapi.pe and the booking of GoToMapi services.",
    "Estes termos regem o uso de gotomapi.pe e a contratação dos serviços da GoToMapi."
  ),
  sections: [
    {
      heading: t(
        "1. Aceptación de los términos",
        "1. Acceptance of the Terms",
        "1. Aceitação dos Termos"
      ),
      body: t(
        "Al utilizar este sitio web o enviar una solicitud de reserva, aceptas estos términos en su totalidad. Si no estás de acuerdo, te pedimos que no uses nuestros servicios.",
        "By using this website or submitting a booking request, you accept these terms in full. If you do not agree, please do not use our services.",
        "Ao utilizar este site ou enviar uma solicitação de reserva, você aceita estes termos na íntegra. Se não concordar, pedimos que não use nossos serviços."
      ),
    },
    {
      heading: t(
        "2. Servicios y reservas",
        "2. Services and Bookings",
        "2. Serviços e Reservas"
      ),
      body: t(
        "Nuestras reservas se confirman por WhatsApp y correo electrónico en menos de 24 horas. Una reserva queda formalizada cuando nuestro equipo confirma disponibilidad y acuerda el pago contigo directamente.",
        "Bookings are confirmed by WhatsApp and email within 24 hours. A booking is finalized once our team confirms availability and agrees payment with you directly.",
        "Nossas reservas são confirmadas por WhatsApp e e-mail em até 24 horas. Uma reserva é formalizada quando nossa equipe confirma a disponibilidade e combina o pagamento diretamente com você."
      ),
    },
    {
      heading: t("3. Precios y pagos", "3. Prices and Payments", "3. Preços e Pagamentos"),
      body: t(
        "Los precios se publican en dólares estadounidenses (USD) y pueden variar según temporada y disponibilidad. Actualmente no aceptamos pagos en línea: los pagos se coordinan directamente con nuestro equipo por los medios oficiales.",
        "Prices are published in US dollars (USD) and may vary by season and availability. We do not currently accept online payments: payments are arranged directly with our team through official channels.",
        "Os preços são publicados em dólares americanos (USD) e podem variar conforme a temporada e a disponibilidade. Atualmente não aceitamos pagamentos on-line: os pagamentos são combinados diretamente com nossa equipe pelos canais oficiais."
      ),
    },
    {
      heading: t(
        "4. Cancelaciones y cambios",
        "4. Cancellations and Changes",
        "4. Cancelamentos e Alterações"
      ),
      body: t(
        "Puedes cancelar o modificar tu reserva sin costo hasta 48 horas antes de la fecha del servicio, siempre que no existan gastos ya incurridos (entradas, trenes o alojamientos). Las condiciones específicas de cada tour se indican al confirmar la reserva.",
        "You can cancel or modify your booking free of charge up to 48 hours before the service date, as long as no costs have been incurred (tickets, trains or accommodation). Specific conditions for each tour are provided upon booking confirmation.",
        "Você pode cancelar ou modificar sua reserva sem custo até 48 horas antes da data do serviço, desde que não haja custos já incorridos (ingressos, trens ou hospedagens). As condições específicas de cada tour são informadas na confirmação da reserva."
      ),
    },
    {
      heading: t(
        "5. Responsabilidad del viajero",
        "5. Traveler Responsibility",
        "5. Responsabilidade do Viajante"
      ),
      body: t(
        "Eres responsable de llevar la documentación requerida (DNI o pasaporte), cumplir los requisitos de salud y seguir las indicaciones de nuestros guías durante los tours.",
        "You are responsible for carrying the required documentation (ID or passport), meeting health requirements and following our guides' instructions during tours.",
        "Você é responsável por portar a documentação exigida (RG ou passaporte), cumprir os requisitos de saúde e seguir as orientações dos nossos guias durante os tours."
      ),
    },
    {
      heading: t(
        "6. Propiedad intelectual",
        "6. Intellectual Property",
        "6. Propriedade Intelectual"
      ),
      body: t(
        "El contenido de este sitio (textos, imágenes y diseño) es propiedad de GoToMapi y no puede reproducirse sin autorización escrita.",
        "The content of this site (texts, images and design) is the property of GoToMapi and may not be reproduced without written permission.",
        "O conteúdo deste site (textos, imagens e design) é propriedade da GoToMapi e não pode ser reproduzido sem autorização por escrito."
      ),
    },
    {
      heading: t(
        "7. Ley aplicable",
        "7. Applicable Law",
        "7. Legislação Aplicável"
      ),
      body: t(
        "Estos términos se rigen por la legislación de la República del Perú. Cualquier controversia se somete a los tribunales de la ciudad de Cusco.",
        "These terms are governed by the laws of the Republic of Peru. Any dispute shall be submitted to the courts of the city of Cusco.",
        "Estes termos são regidos pela legislação da República do Peru. Qualquer controvérsia será submetida aos tribunais da cidade de Cusco."
      ),
    },
  ],
};

export const PRIVACY: LegalDocument = {
  badge: t("Legal", "Legal", "Legal"),
  title: t("Política de privacidad", "Privacy Policy", "Política de Privacidade"),
  updated: t(
    "Última actualización: agosto de 2026",
    "Last updated: August 2026",
    "Última atualização: agosto de 2026"
  ),
  intro: t(
    "En GoToMapi nos comprometemos a proteger tus datos personales. Esta política explica qué datos recopilamos y cómo los usamos.",
    "At GoToMapi we are committed to protecting your personal data. This policy explains what data we collect and how we use it.",
    "Na GoToMapi nos comprometemos a proteger seus dados pessoais. Esta política explica quais dados coletamos e como os usamos."
  ),
  sections: [
    {
      heading: t(
        "1. Datos que recopilamos",
        "1. Data We Collect",
        "1. Dados que Coletamos"
      ),
      body: t(
        "Nombre completo, correo electrónico, número de WhatsApp, fecha de viaje, número de viajeros y el contenido de los mensajes que nos envías a través de los formularios.",
        "Full name, email address, WhatsApp number, travel date, number of travelers and the content of messages you send through our forms.",
        "Nome completo, e-mail, número de WhatsApp, data da viagem, número de viajantes e o conteúdo das mensagens enviadas pelos nossos formulários."
      ),
    },
    {
      heading: t("2. Uso de los datos", "2. Use of Data", "2. Uso dos Dados"),
      body: t(
        "Usamos tus datos para gestionar y confirmar tus reservas, responderte por WhatsApp y correo, y —si te suscribes— enviarte nuestra newsletter. No vendemos tus datos a terceros.",
        "We use your data to manage and confirm your bookings, respond by WhatsApp and email, and —if you subscribe— send you our newsletter. We never sell your data to third parties.",
        "Usamos seus dados para gerenciar e confirmar suas reservas, responder por WhatsApp e e-mail e —se você se inscrever— enviar nossa newsletter. Não vendemos seus dados a terceiros."
      ),
    },
    {
      heading: t(
        "3. Almacenamiento y seguridad",
        "3. Storage and Security",
        "3. Armazenamento e Segurança"
      ),
      body: t(
        "Tus datos se procesan y almacenan en plataformas seguras (Vercel, Resend, Supabase). Aplicamos medidas técnicas y organizativas para protegerlos, incluyendo cifrado en tránsito y control de accesos.",
        "Your data is processed and stored on secure platforms (Vercel, Resend, Supabase). We apply technical and organizational measures to protect it, including encryption in transit and access control.",
        "Seus dados são processados e armazenados em plataformas seguras (Vercel, Resend, Supabase). Aplicamos medidas técnicas e organizacionais para protegê-los, incluindo criptografia em trânsito e controle de acesso."
      ),
    },
    {
      heading: t(
        "4. Cookies y analítica",
        "4. Cookies and Analytics",
        "4. Cookies e Analytics"
      ),
      body: t(
        "Utilizamos Google Analytics 4 y el Meta Pixel para medir el uso del sitio y mejorar nuestros servicios. Estas herramientas pueden instalar cookies; puedes rechazarlas desde tu navegador sin que afecte al funcionamiento del sitio.",
        "We use Google Analytics 4 and the Meta Pixel to measure site usage and improve our services. These tools may set cookies; you can disable them in your browser without affecting site functionality.",
        "Usamos o Google Analytics 4 e o Meta Pixel para medir o uso do site e melhorar nossos serviços. Essas ferramentas podem instalar cookies; você pode recusá-los pelo navegador sem afetar o funcionamento do site."
      ),
    },
    {
      heading: t(
        "5. Servicios de terceros",
        "5. Third-Party Services",
        "5. Serviços de Terceiros"
      ),
      body: t(
        "El envío de correos se realiza mediante Resend, las imágenes y contenidos pueden alojarse en Supabase, y el sitio se sirve desde Vercel. Cada proveedor actúa como encargado del tratamiento conforme a su propia política.",
        "Email delivery is handled by Resend, images and content may be hosted on Supabase, and the site is served by Vercel. Each provider acts as a data processor under its own policy.",
        "O envio de e-mails é feito pela Resend, imagens e conteúdos podem ser hospedados na Supabase, e o site é servido pela Vercel. Cada fornecedor atua como operador de dados conforme sua própria política."
      ),
    },
    {
      heading: t("6. Tus derechos", "6. Your Rights", "6. Seus Direitos"),
      body: t(
        "Puedes solicitar acceso, rectificación o supresión de tus datos escribiéndonos por correo o WhatsApp. Responderemos en un plazo máximo de 15 días hábiles.",
        "You can request access, rectification or deletion of your data by writing to us by email or WhatsApp. We will respond within 15 business days.",
        "Você pode solicitar acesso, correção ou exclusão dos seus dados escrevendo para nós por e-mail ou WhatsApp. Responderemos em até 15 dias úteis."
      ),
    },
    {
      heading: t("7. Contacto", "7. Contact", "7. Contato"),
      body: t(
        "Para cualquier consulta sobre esta política, escríbenos a nuestro correo o WhatsApp publicados en la sección de contacto de este sitio.",
        "For any questions about this policy, write to us at the email or WhatsApp published in the contact section of this site.",
        "Para qualquer dúvida sobre esta política, escreva para o nosso e-mail ou WhatsApp publicados na seção de contato deste site."
      ),
    },
  ],
};