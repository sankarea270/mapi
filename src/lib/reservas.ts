"use client";

import { supabase } from "@/lib/supabase";

export interface DatosReserva {
  tourSlug: string;
  tourName: string;
  fullName: string;
  email: string;
  phone?: string;
  date: string;
  travelers: number;
  message?: string;
  locale: string;
}

/**
 * Deja constancia de una solicitud para que aparezca en el panel.
 *
 * Hasta ahora los formularios solo abrían WhatsApp: si el cliente cerraba la
 * conversación sin escribir, o el mensaje se perdía entre otros cien, la
 * solicitud no existía en ningún sitio. Esto la registra además en la base
 * de datos, sin cambiar nada de lo que ve quien reserva.
 *
 * Dos decisiones deliberadas:
 *
 *  · Nunca lanza. Que la base de datos falle no puede impedir que alguien
 *    contacte con la agencia; el negocio pierde menos con una solicitud sin
 *    registrar que con un cliente bloqueado por un error que no entiende.
 *
 *  · No se espera antes de abrir WhatsApp. `window.open` tiene que ejecutarse
 *    dentro del gesto del usuario o el navegador lo bloquea por emergente;
 *    esperar a la respuesta del servidor rompería esa cadena. Por eso quien
 *    llama abre WhatsApp primero y deja esto corriendo por detrás.
 */
export async function guardarReserva(d: DatosReserva): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase.from("reservations").insert({
      /* La columna es obligatoria y en el formulario general el tour es un
         campo libre que puede quedar vacío. */
      tour_slug: d.tourSlug || "sin-especificar",
      tour_name: d.tourName || null,
      full_name: d.fullName,
      email: d.email,
      phone: d.phone || null,
      travel_date: d.date,
      travelers: d.travelers,
      notes: d.message || null,
      locale: d.locale,
      source: "web",
    });
    if (error) console.error("[reservas] No se pudo registrar la solicitud:", error.message);
  } catch (error) {
    console.error("[reservas] No se pudo registrar la solicitud:", error);
  }
}
