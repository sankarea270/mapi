/**
 * Fotos de la portada, como respaldo del repositorio.
 *
 * Lo que se ve en la web sale de la tabla `hero_slides` de Supabase, editable
 * desde el panel. Esto es lo que se usa si Supabase no está configurado, no
 * responde o está vacío: sin esto, una caída de la base de datos dejaría la
 * portada sin ninguna foto, que es justo la primera pantalla del sitio.
 */

export interface HeroSlide {
  src: string;
  alt: string;
  /** Miniatura en base64 que se enseña mientras carga la foto de verdad. */
  blur?: string;
  /** Nombre del lugar que se ve, ya en el idioma de la página. */
  titulo?: string;
  /** Una frase que invite a ir. */
  descripcion?: string;
  /** Adónde lleva la leyenda: la página del destino o una categoría de tours. */
  href?: string;
}

type Texto3 = { es: string; en: string; pt: string };

export interface LeyendaPortada {
  href: string;
  titulo: Texto3;
  descripcion: Texto3;
}

/**
 * Leyendas de las fotos de portada, en el orden en que están publicadas.
 *
 * Son las que siembra la migración 010 y las que se usan si esa migración
 * aún no se ha pasado: la web no se queda sin leyenda por eso. Cada una
 * lleva a una ruta que existe. Salkantay no es un destino con página propia
 * y va a los tours de aventura, que es donde está su caminata.
 */
export const LEYENDAS_PORTADA: LeyendaPortada[] = [
  {
    href: "/destinos/cusco",
    titulo: { es: "Cusco", en: "Cusco", pt: "Cusco" },
    descripcion: {
      es: "La capital inca: muros imperiales, balcones coloniales y plazas que no duermen.",
      en: "The Inca capital: imperial walls, colonial balconies and squares that never sleep.",
      pt: "A capital inca: muros imperiais, sacadas coloniais e praças que nunca dormem.",
    },
  },
  {
    href: "/destinos/machu-picchu",
    titulo: { es: "Machu Picchu", en: "Machu Picchu", pt: "Machu Picchu" },
    descripcion: {
      es: "La ciudadela sagrada que asoma entre nubes y montañas. Un viaje de una vez en la vida.",
      en: "The sacred citadel rising between clouds and peaks. A once-in-a-lifetime journey.",
      pt: "A cidadela sagrada que surge entre nuvens e montanhas. Uma viagem única na vida.",
    },
  },
  {
    href: "/destinos/valle-sagrado",
    titulo: { es: "Valle Sagrado", en: "Sacred Valley", pt: "Vale Sagrado" },
    descripcion: {
      es: "Terrazas incas, mercados andinos y el río Urubamba al pie de los nevados.",
      en: "Inca terraces, Andean markets and the Urubamba River beneath snowy peaks.",
      pt: "Terraços incas, mercados andinos e o rio Urubamba aos pés dos nevados.",
    },
  },
  {
    href: "/destinos/arequipa",
    titulo: { es: "Arequipa", en: "Arequipa", pt: "Arequipa" },
    descripcion: {
      es: "La Ciudad Blanca de sillar volcánico, custodiada por el Misti.",
      en: "The White City carved from volcanic stone, guarded by El Misti.",
      pt: "A Cidade Branca de pedra vulcânica, guardada pelo Misti.",
    },
  },
  {
    href: "/destinos/colca",
    titulo: { es: "Cañón del Colca", en: "Colca Canyon", pt: "Cânion do Colca" },
    descripcion: {
      es: "Uno de los cañones más profundos del planeta y el vuelo del cóndor andino.",
      en: "One of the deepest canyons on Earth, where the Andean condor soars.",
      pt: "Um dos cânions mais profundos do planeta e o voo do condor andino.",
    },
  },
  {
    href: "/destinos/puno",
    titulo: { es: "Puno y el Titicaca", en: "Puno & Lake Titicaca", pt: "Puno e o Titicaca" },
    descripcion: {
      es: "Islas flotantes de totora sobre el lago navegable más alto del mundo.",
      en: "Floating reed islands on the highest navigable lake in the world.",
      pt: "Ilhas flutuantes de totora no lago navegável mais alto do mundo.",
    },
  },
  {
    href: "/destinos/nazca",
    titulo: { es: "Líneas de Nazca", en: "Nazca Lines", pt: "Linhas de Nazca" },
    descripcion: {
      es: "Figuras gigantes trazadas en el desierto que solo se descifran desde el cielo.",
      en: "Giant figures drawn on the desert that only reveal themselves from the sky.",
      pt: "Figuras gigantes traçadas no deserto que só se revelam do céu.",
    },
  },
  {
    href: "/destinos/lima",
    titulo: { es: "Lima", en: "Lima", pt: "Lima" },
    descripcion: {
      es: "Capital gastronómica de América, frente al Pacífico y con siglos de historia.",
      en: "The culinary capital of the Americas, facing the Pacific with centuries of history.",
      pt: "Capital gastronômica das Américas, de frente para o Pacífico e cheia de história.",
    },
  },
  {
    href: "/destinos/amazonia",
    titulo: { es: "Amazonía", en: "Amazon", pt: "Amazônia" },
    descripcion: {
      es: "Ríos inmensos, fauna única y noches con el sonido de la selva.",
      en: "Mighty rivers, unique wildlife and nights filled with jungle sounds.",
      pt: "Rios imensos, fauna única e noites com o som da floresta.",
    },
  },
  {
    href: "/destinos/norte",
    titulo: { es: "Norte del Perú", en: "Northern Peru", pt: "Norte do Peru" },
    descripcion: {
      es: "Tumbas de señores moches, la ciudad de barro de Chan Chan y sol todo el año.",
      en: "Moche royal tombs, the adobe city of Chan Chan and sunshine all year round.",
      pt: "Tumbas de senhores mochicas, a cidade de barro de Chan Chan e sol o ano todo.",
    },
  },
  {
    href: "/tours?categoria=aventura",
    titulo: { es: "Salkantay", en: "Salkantay", pt: "Salkantay" },
    descripcion: {
      es: "Nevado sagrado y ruta épica hacia Machu Picchu para espíritus aventureros.",
      en: "A sacred snow peak and an epic trail to Machu Picchu for adventurous spirits.",
      pt: "Nevado sagrado e rota épica rumo a Machu Picchu para espíritos aventureiros.",
    },
  },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1920&auto=format&fit=crop",
    alt: "Machu Picchu, maravilla del mundo",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFBgf/xAAoEAACAQMDAwMFAQAAAAAAAAABAgMABBEFEiETMUEGUXEUIjJhgZH/xAAWAQEBAQAAAAAAAAAAAAAAAAABAAL/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREx/9oADAMBAAIRAxEAPwDnvTLwg5BGcU5aadNPqEcdw3hjDMueATjFW9PtlW2EcKfUDaQW7HB7U1p8Ct1brH3E5z75pxXR9W0P6lTI08LgZ7c/FY4SX2jajPb64zt0nKRzR8SRnsMjngj5rZ3mDk9uO1LeL0xJql3eCa12W0jSRqHyXA7cmiwmMf/Z",
  },
  {
    src: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1920&auto=format&fit=crop",
    alt: "Valle Sagrado de los Incas",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQCAwUG/8QAJhAAAgEDBAEEAwEAAAAAAAAAAQIDAAQRBRIhMRNBUWFxFCKBkf/EABYBAQEBAAAAAAAAAAAAAAAAAAECA//EABkRAQEBAQEBAAAAAAAAAAAAAAEAAhExIf/aAAwDAQACEQMRAD8A5kLjvr5pxI8DJqhJgOc9088/FevcMGK4AGM8VXGzuDdwsvbmPYJf0Z5z2ahc31xMi+Vuf1OMD/KhDI5nJDEZPOTg05cXKnHi+sCBjuKa1l6YmjIyD3T1q0iKGlfcxPfgCs1bt0kBY+wOKt/InETJu2fkDzigJa//2Q==",
  },
  {
    src: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1920&auto=format&fit=crop",
    alt: "Vinicunca, montaña de 7 colores",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAUBBAYH/8QAJxAAAgEDAwQBBQEAAAAAAAAAAQIDBAURAAYhBxITMRQiI0FRYXH/xAAWAQEBAQAAAAAAAAAAAAAAAAABAAL/xAAYEQEBAQEBAAAAAAAAAAAAAAABAAIRMf/aAAwDAQACEQMRAD8A54EJOCMEaIFY8jBxjB1crB0wvV3pDUU1JGE9wil3YkqCQSOB5OjF70avVdYkuRkQRj3eopI+WVcjkn5OtIuBYVq+xRw+NpBI75JCDBGPzqt6i3X3N2SzMWpp5TKBw2wY/rVbtLePdu+tpWt1UZkWZZhBUlBESMhTgjGeOeBqUtS2yWzr1Ga3VEUtJVRmOREVlJKkZXODxj41n73f7k29TUIpqaUzOBJFI5d0AAPq4PJAJJ+daOvzN8gLc57jeq2nlrY4Ioo2hklqJ2OMJkrH6icnH9Z1ZuPVG5VVPJSLGIXkbLzhnL4C58Y9QB9Hzq1arPcr/cJLZTMFo9sofiWeblVHJA9Y/Os/vWnhprqKKl2rR28U6lBWo5d5Wf5ZioAXnoAHTGowLZXblr5pKSsqGf3k+QqWZV9uCyjPK+0Dpk/I0aNG5v/Z",
  },
  {
    src: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1920&auto=format&fit=crop",
    alt: "Laguna Humantay, joya de los Andes",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQBAgUG/8QAKBAAAgEDAwMEAgMAAAAAAAAAAQIDAAQRBRIhMUEGE1FhIoEjMnGh0f/EABYBAQEBAAAAAAAAAAAAAAAAAAIBA//EABkRAQEBAQEBAAAAAAAAAAAAAAEAAhExIf/aAAwDAQACEQMRAD8A5oxD4qSgU5GCKf0+xkvrmOCBT7jDt4GP7rVXnTg05Ub9oW6dvrj1o3WVQG+MdcH/ABpSaLqNrq1kl1bk4PBU8lT4IroYPWdxb3EaTJHOYjlXU/kv3/leXOs2N/dLDcxuJWXcs4BXcPzOJ72kjbmvjVWKJbXqk26L/FdWNuQ0oEauRu3qB/JHjpXqGjQ3+naNBBftum35LRjAJwPNFdBn//Z",
  },
  {
    src: "https://images.unsplash.com/photo-1621887178805-37e802d9ed4c?q=80&w=1920&auto=format&fit=crop",
    alt: "Sacsayhuamán, fortaleza inca en Cusco",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQCAwUG/8QAKBAAAgECBAYCAwEAAAAAAAAAAQIDBBEABRIhMRMUIkFRYXGBBpGh/8QAFgEBAQEAAAAAAAAAAAAAAAAAAgAD/8QAHBEAAgICAwAAAAAAAAAAAAAAAAECEQMSITFh/9oADAMBAAIRAxEAPwDlY80p2i1wRTSnqLamqr/PbmVXPmWfKaOsqqp2Vpp29Cg8LYg+r73wrjJVJImg3sTxD1Yx/mOi4OZKD1gC22+13iDxxdHYycXU7bM80pJ5GeWeqhBF/UrggFrE7X7YrfM81qFiqpJp2Qs+h2UbqLAAX3/mMuGXSVVfVQh+GdTqCRcH8sMaKVPqpRi9JVZ3ndfmtbJWVTH1WVQqiwUCwGGCrhHF1Kx0r+OLbW/OGM0RHE//2Q==",
  },
];
