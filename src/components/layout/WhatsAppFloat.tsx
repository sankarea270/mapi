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
      className={`fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-600/30 transition-transform hover:scale-110 sm:right-8 sm:bottom-8 ${
        reduced ? "" : "animate-[pulse_3s_ease-in-out_infinite]"
      }`}
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
