"use client";

import { useCallback, useState } from "react";
import { whatsappLink } from "@/config/site";

/**
 * Envío por WhatsApp con confirmación.
 *
 * Antes los formularios hacían `window.open` y ahí terminaba todo: sin aviso
 * de éxito, de error ni de nada. Si el navegador bloqueaba la ventana —cosa
 * habitual en móvil— la persona creía haber enviado su reserva y no había
 * salido nada.
 *
 * No se intenta detectar el bloqueo mirando lo que devuelve `window.open`:
 * con la opción `noopener` la especificación obliga a devolver `null`
 * SIEMPRE, se haya abierto la ventana o no, así que ese valor no distingue
 * un caso del otro. En vez de adivinar, la pantalla de confirmación muestra
 * siempre el enlace directo: si WhatsApp se abrió, sobra; si no, resuelve.
 */
export function useWhatsappSend() {
  const [url, setUrl] = useState<string | null>(null);

  const send = useCallback((message: string) => {
    const link = whatsappLink(message);
    setUrl(link);
    window.open(link, "_blank", "noopener,noreferrer");
  }, []);

  const reset = useCallback(() => setUrl(null), []);

  return { url, send, reset, isSent: url !== null };
}
