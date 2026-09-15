/*
 * Datos de contacto, legales y redes de la agencia, editables desde el panel.
 *
 * Antes estaban escritos en el código y repartidos por dieciséis archivos:
 * la cabecera, el pie, el menú, contacto, las fichas, los textos legales, el
 * botón flotante… Cambiar el correo era buscarlo archivo por archivo, y así
 * quedaron cosas como una dirección de ejemplo («Av. El Sol 123») en la
 * página legal y un Instagram que no existe enlazado en todo el sitio.
 *
 * Ahora se guardan en Supabase (tabla `site_settings`, migración 009), se
 * editan en «Ajustes» del panel y la web los lee al compilar. Estos valores
 * son los de reserva: los que se usan si la tabla todavía no existe o un
 * campo nunca se rellenó. Salen de la página de Facebook de la agencia.
 */

export type RedSocial = "whatsapp" | "facebook" | "instagram" | "tiktok" | "youtube";

export interface Ajustes {
  razonSocial: string;
  ruc: string;
  actividad: string;
  licenciaFuncionamiento: string;
  certificadoAutorizacion: string;
  domicilio: string;
  ciudad: string;
  /** Como se enseña: "+51 986 377 524". */
  telefono: string;
  /** Solo dígitos con prefijo de país: "51986377524". */
  whatsapp: string;
  /** Correo general. */
  correo: string;
  /** Correo de reservas, en el dominio de la agencia. */
  correoReservas: string;
  horario: string;
  /** Fondo de la cabecera de «Tours» cuando no hay categoría elegida. Vacío:
      se usa la foto del tour mejor valorado. */
  fondoTours: string;
  /** Direcciones completas. Vacía = esa red no se enseña en ninguna parte. */
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  /** Dirección de la ficha de la agencia en TripAdvisor. Vacía: no se leen
      reseñas de allí. */
  tripadvisor: string;
  /** Dónde se enseñan esas reseñas: "inicio", "tours" o los dos. */
  tripadvisorMostrar: string;
}

export const AJUSTES_POR_DEFECTO: Ajustes = {
  razonSocial: "MAPI TRAVELS TOUR OPERATOR E.I.R.L.",
  ruc: "20491103753",
  actividad: "Agencia de viajes y operador turístico",
  licenciaFuncionamiento: "002059-2012",
  certificadoAutorizacion: "301-2012",
  domicilio: "Calle Siete Cuartones 344, Cusco, Perú",
  ciudad: "Cusco",
  telefono: "+51 986 377 524",
  whatsapp: "51986377524",
  correo: "gotomapiperu@gmail.com",
  /* Comprobado contra el servidor de correo del dominio: acepta
     reservas@ (250 Ok) y rechaza una dirección inventada, así que el buzón
     existe. info@, que enseñaba «Nosotros», no existe. */
  correoReservas: "reservas@gotomachupicchuperu.com",
  horario: "Lun – Dom · 8:00 – 20:00",
  fondoTours: "",
  facebook: "https://www.facebook.com/profile.php?id=61594386779195",
  /* Vacíos a propósito. La web enlazaba instagram.com/gotomapi, que no
     existe («Profile no está disponible»), y tiktok.com/@gotomapi, sin
     comprobar. Un enlace a una cuenta que no existe resta más confianza que
     no enlazar: se enseñan en cuanto se ponga la dirección en el panel. */
  instagram: "",
  tiktok: "",
  youtube: "",
  tripadvisor: "",
  tripadvisorMostrar: "inicio,tours",
};

/** Los campos que se pueden guardar, para no aceptar claves extrañas. */
export const CAMPOS_AJUSTES = Object.keys(AJUSTES_POR_DEFECTO) as Array<keyof Ajustes>;

/** Mezcla lo guardado con los valores de reserva, campo a campo. */
export function mezclarAjustes(guardado: Partial<Record<string, unknown>> | null | undefined): Ajustes {
  const a = { ...AJUSTES_POR_DEFECTO };
  if (!guardado) return a;
  for (const k of CAMPOS_AJUSTES) {
    const v = guardado[k];
    /* Vacío a propósito se respeta en las redes —no enseñarla— y en el fondo
       de tours —usar la foto automática—. En el resto, vacío significa "no
       lo he rellenado" y se usa el de reserva: una ficha sin teléfono o sin
       RUC no tiene sentido. */
    const vacioValido =
      k === "facebook" ||
      k === "instagram" ||
      k === "tiktok" ||
      k === "youtube" ||
      k === "fondoTours" ||
      k === "tripadvisor" ||
      k === "tripadvisorMostrar";
    if (typeof v === "string" && (v.trim() !== "" || vacioValido)) a[k] = v.trim();
  }
  if (!a.whatsapp) a.whatsapp = a.telefono.replace(/\D/g, "");
  return a;
}

export const MENSAJE_WHATSAPP = "Hola, quiero planificar un viaje a Perú";

export function enlaceWhatsapp(a: Ajustes, mensaje?: string): string {
  const numero = a.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje ?? MENSAJE_WHATSAPP)}`;
}

/** "+51 986 377 524" → "tel:+51986377524". */
export function enlaceTelefono(a: Ajustes): string {
  const digitos = a.telefono.replace(/[^\d+]/g, "");
  return `tel:${digitos.startsWith("+") ? digitos : `+${digitos}`}`;
}

export const ETIQUETA_RED: Record<RedSocial, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

/** Las redes con dirección, en orden. WhatsApp no entra: no es una red a
    la que "seguir", es un canal de contacto, y tiene su propio sitio. */
export function redesConEnlace(a: Ajustes): Array<{ red: Exclude<RedSocial, "whatsapp">; href: string; etiqueta: string }> {
  return (["facebook", "instagram", "tiktok", "youtube"] as const)
    .filter((r) => a[r])
    .map((r) => ({ red: r, href: a[r], etiqueta: ETIQUETA_RED[r] }));
}
