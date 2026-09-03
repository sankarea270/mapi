"use client";

import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/config/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function WhatsAppFloat() {
  const t = useTranslations("nav");
  const reduced = useReducedMotion();

  return (
    <a
      href={whatsappLink(
        "Hola, me gustaría recibir información sobre tours y paquetes en Perú."
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappFloat")}
      /* Teal del logotipo, igual que el botón de reserva de las fichas.
         Antes era el verde corporativo de WhatsApp: con el botón de la ficha
         ya en color de marca, quedaban dos verdes distintos para la misma
         acción en la misma pantalla. El icono es quien identifica el canal. */
      className={`fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-900/25 transition-transform hover:scale-110 hover:bg-teal-700 sm:right-8 sm:bottom-8 ${
        reduced ? "" : "animate-[pulse_3s_ease-in-out_infinite]"
      }`}
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
