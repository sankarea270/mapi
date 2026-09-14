"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { enlaceWhatsapp, redesConEnlace, type RedSocial } from "@/config/ajustes";
import { useAjustes } from "@/components/providers/Ajustes";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/layout/SocialIcons";
import { cn } from "@/lib/utils";

const ICONO: Record<RedSocial, (p: { className?: string }) => React.ReactElement> = {
  whatsapp: WhatsAppIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
};

/* Los colores propios de cada red, y solo aquí. En el resto del sitio los
   botones van en el petróleo de la marca; en un selector de canales, en
   cambio, el color es lo que permite reconocer cada uno sin leer. */
const FONDO: Record<RedSocial, string> = {
  whatsapp: "bg-[#25D366]",
  facebook: "bg-[#1877F2]",
  instagram: "bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)]",
  tiktok: "bg-slate-950 ring-1 ring-white/15",
  youtube: "bg-[#FF0000]",
};

/**
 * Botón flotante de contacto: al tocarlo se despliegan los canales.
 *
 * Antes era un único botón de WhatsApp con un latido infinito. El latido
 * llamaba la atención en cada pantalla y durante toda la visita, que es lo
 * que termina haciendo que un botón se ignore; y solo ofrecía un canal.
 *
 * Ahora ofrece todos los que la agencia tenga configurados en el panel
 * —WhatsApp siempre; Facebook, Instagram, TikTok y YouTube si tienen
 * dirección— y se despliega en abanico hacia arriba: cada canal sale un poco
 * después del anterior, empezando por el más cercano al pulgar, con un
 * pequeño rebote al llegar. El rótulo llega un instante detrás del círculo.
 * Así se lee como un gesto que se abre, no como una lista que aparece.
 *
 * Solo avisa una vez: un anillo que se expande a los pocos segundos de la
 * primera visita de la sesión, y nada más.
 */
export function BotonContacto() {
  const t = useTranslations("nav");
  const ajustes = useAjustes();
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState(false);
  const idLista = useId();
  const botonRef = useRef<HTMLButtonElement>(null);

  const canales: Array<{ red: RedSocial; href: string; etiqueta: string }> = [
    {
      red: "whatsapp",
      href: enlaceWhatsapp(ajustes, "Hola, me gustaría recibir información sobre tours y paquetes en Perú."),
      etiqueta: "WhatsApp",
    },
    ...redesConEnlace(ajustes),
  ];

  /* Escape cierra y devuelve el foco al botón, como cualquier menú. */
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      botonRef.current?.focus();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  /* El aviso, una vez por sesión. `sessionStorage` puede no estar disponible
     (modo privado estricto): entonces simplemente no se avisa. */
  useEffect(() => {
    let visto = true;
    try {
      visto = sessionStorage.getItem("mapi-aviso-contacto") === "1";
      if (!visto) sessionStorage.setItem("mapi-aviso-contacto", "1");
    } catch {
      /* Sin almacenamiento, sin aviso. */
    }
    if (visto) return;
    const id = setTimeout(() => setAviso(true), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {/* Toque fuera: cierra. Un velo apenas perceptible, que además separa
          los canales del contenido que queda detrás. */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => setAbierto(false)}
        className={cn(
          "boton-contacto-velo fixed inset-0 z-40 bg-slate-950/15 backdrop-blur-[2px]",
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end gap-3 sm:right-8 sm:bottom-8">
        <ul
          id={idLista}
          aria-hidden={!abierto}
          className={cn("flex flex-col items-end gap-3", !abierto && "pointer-events-none")}
        >
          {canales.map((c, i) => {
            const Icono = ICONO[c.red];
            /* El más cercano al botón sale primero. */
            const orden = canales.length - 1 - i;
            return (
              <li
                key={c.red}
                className="boton-contacto-canal"
                data-abierto={abierto || undefined}
                style={{ ["--orden" as string]: orden }}
              >
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={abierto ? undefined : -1}
                  onClick={() => setAbierto(false)}
                  className="group flex items-center gap-3 outline-none"
                >
                  <span className="boton-contacto-rotulo rounded-full bg-white px-3.5 py-1.5 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-slate-800 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition-colors group-hover:text-teal-700 group-focus-visible:ring-2 group-focus-visible:ring-teal-600">
                    {c.etiqueta}
                  </span>
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-full text-white shadow-lg shadow-slate-900/20 transition-transform duration-300 group-hover:scale-110",
                      FONDO[c.red]
                    )}
                  >
                    <Icono className="size-[22px]" />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <button
          ref={botonRef}
          type="button"
          onClick={() => {
            setAbierto((a) => !a);
            setAviso(false);
          }}
          aria-expanded={abierto}
          aria-controls={idLista}
          aria-label={abierto ? t("close") : t("contactOpen")}
          className={cn(
            "relative grid size-14 place-items-center rounded-full text-white shadow-lg shadow-teal-900/25 outline-none transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-teal-300",
            abierto ? "bg-slate-900" : "bg-teal-600 hover:bg-teal-700"
          )}
        >
          {aviso && !abierto && (
            <span
              aria-hidden
              className="boton-contacto-aviso absolute inset-0 rounded-full bg-teal-500"
              onAnimationEnd={() => setAviso(false)}
            />
          )}
          {/* Los dos iconos a la vez, cruzándose: el bocadillo gira y se
              va mientras la aspa llega girando desde el lado contrario. */}
          <MessageCircle
            aria-hidden
            className={cn(
              "boton-contacto-icono absolute size-7",
              abierto ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
          <X
            aria-hidden
            className={cn(
              "boton-contacto-icono absolute size-7",
              abierto ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
            )}
          />
        </button>
      </div>
    </>
  );
}
