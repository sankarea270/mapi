export interface NavLinkItem {
  labelKey: string;
  href: string;
}

export interface NavSection {
  titleKey: string;
  links: NavLinkItem[];
}

export interface NavFeatured {
  image: string;
  titleKey: string;
  href: string;
  ctaKey: string;
}

export type NavItem =
  | { kind: "category"; labelKey: string; categorySlug: string }
  | { kind: "tours"; labelKey: string; href: string }
  | {
      kind: "links";
      labelKey: string;
      href: string;
      sections: NavSection[];
      featured?: NavFeatured;
    };

export const NAV_ITEMS: NavItem[] = [
  {
    kind: "category",
    labelKey: "nav.machuPicchu",
    categorySlug: "machu-picchu",
  },
  { kind: "tours", labelKey: "nav.tours", href: "/tours" },
  {
    kind: "links",
    labelKey: "nav.destinations",
    href: "/destinos",
    sections: [
      {
        titleKey: "destinos.andesCusco",
        links: [
          { labelKey: "destinos.cusco", href: "/destinos/cusco" },
          { labelKey: "destinos.machuPicchu", href: "/destinos/machu-picchu" },
          { labelKey: "destinos.sacredValley", href: "/destinos/valle-sagrado" },
        ],
      },
      {
        titleKey: "destinos.south",
        links: [
          { labelKey: "destinos.arequipa", href: "/destinos/arequipa" },
          { labelKey: "destinos.punoTiticaca", href: "/destinos/puno" },
          { labelKey: "destinos.nazca", href: "/destinos/nazca" },
          { labelKey: "destinos.colca", href: "/destinos/colca" },
        ],
      },
      {
        titleKey: "destinos.north",
        links: [
          { labelKey: "destinos.iquitos", href: "/destinos/iquitos" },
          { labelKey: "destinos.puertoMaldonado", href: "/destinos/puerto-maldonado" },
          { labelKey: "destinos.lima", href: "/destinos/lima" },
          { labelKey: "destinos.manu", href: "/destinos/manu" },
        ],
      },
    ],
    featured: {
      image: "https://picsum.photos/seed/mapi-feat-valle/600/800",
      titleKey: "destinos.machuPicchu",
      href: "/destinos/machu-picchu",
      ctaKey: "nav.seeAll",
    },
  },
  {
    kind: "links",
    labelKey: "nav.adventure",
    href: "/aventura",
    sections: [
      {
        titleKey: "aventura.trekking",
        links: [
          { labelKey: "aventura.rainbow", href: "/tours?categoria=rainbow-mountain" },
          { labelKey: "aventura.humantay", href: "/tours?categoria=humantay" },
          { labelKey: "aventura.palccoyo", href: "/tours?categoria=palccoyo" },
          { labelKey: "aventura.incaTrail", href: "/tours?categoria=camino-inca" },
        ],
      },
      {
        titleKey: "aventura.sports",
        links: [
          { labelKey: "aventura.rafting", href: "/aventura/rafting" },
          { labelKey: "aventura.bike", href: "/aventura/ciclismo" },
          { labelKey: "aventura.quad", href: "/aventura/cuatrimotos" },
          { labelKey: "aventura.zipline", href: "/aventura/tirolesa" },
        ],
      },
    ],
    featured: {
      image: "https://picsum.photos/seed/mapi-feat-rainbow/600/800",
      titleKey: "aventura.rainbow",
      href: "/tours/rainbow-mountain",
      ctaKey: "nav.seeAll",
    },
  },
  {
    kind: "links",
    labelKey: "nav.packages",
    href: "/paquetes",
    sections: [
      {
        titleKey: "paquetes.circuits",
        links: [
          { labelKey: "paquetes.cuscoExpress", href: "/paquetes/cusco-express" },
          { labelKey: "paquetes.southPeru", href: "/paquetes/sur-del-peru" },
          { labelKey: "paquetes.peruClassic", href: "/paquetes/peru-clasico" },
          { labelKey: "paquetes.northPeru", href: "/paquetes/norte-del-peru" },
        ],
      },
      {
        titleKey: "paquetes.specials",
        links: [
          { labelKey: "paquetes.honeymoon", href: "/paquetes/luna-de-miel" },
          { labelKey: "paquetes.family", href: "/paquetes/familia" },
          { labelKey: "paquetes.students", href: "/paquetes/grupos" },
        ],
      },
    ],
    featured: {
      image: "https://picsum.photos/seed/mapi-feat-south/600/800",
      titleKey: "paquetes.southPeru",
      href: "/paquetes/sur-del-peru",
      ctaKey: "nav.seeAll",
    },
  },
  {
    kind: "links",
    labelKey: "nav.experiences",
    href: "/experiencias",
    sections: [
      {
        titleKey: "experiencias.culture",
        links: [
          { labelKey: "experiencias.weaving", href: "/experiencias/textileria" },
          { labelKey: "experiencias.festivals", href: "/experiencias/festivales" },
        ],
      },
      {
        titleKey: "experiencias.gastronomy",
        links: [
          { labelKey: "experiencias.cooking", href: "/experiencias/cocina" },
          { labelKey: "experiencias.foodTour", href: "/experiencias/gastronomia" },
          { labelKey: "experiencias.pisco", href: "/experiencias/pisco" },
        ],
      },
      {
        titleKey: "experiencias.photography",
        links: [
          { labelKey: "experiencias.photoTour", href: "/experiencias/fotografia" },
          { labelKey: "experiencias.starlight", href: "/experiencias/astroturismo" },
        ],
      },
    ],
  },
  {
    kind: "links",
    labelKey: "nav.travelGuide",
    href: "/guia",
    sections: [
      {
        titleKey: "guia.before",
        links: [
          { labelKey: "guia.howToGet", href: "/guia/como-llegar" },
          { labelKey: "guia.bestTime", href: "/guia/mejor-epoca" },
          { labelKey: "guia.packing", href: "/guia/que-llevar" },
        ],
      },
      {
        titleKey: "guia.help",
        links: [
          { labelKey: "guia.safety", href: "/guia/seguridad" },
          { labelKey: "guia.visa", href: "/guia/visas" },
          { labelKey: "guia.faqLink", href: "/guia/faq" },
          { labelKey: "guia.contactUs", href: "/contacto" },
        ],
      },
    ],
  },
];

export function getNavItemCount(): number {
  return NAV_ITEMS.length;
}
