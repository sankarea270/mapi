import { ArrowRight, BadgeCheck, CalendarX2, FileCheck2, ShieldCheck, Ticket, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getAjustes } from "@/lib/content";
import { crearTerminos } from "@/data/legal";

/* Un icono por cada punto del resumen de los términos, en su orden:
   solicitud, pago, cancelación y entradas. */
const ICONOS = [FileCheck2, Wallet, CalendarX2, Ticket];

/**
 * Lo esencial de los términos, dentro de la información legal de «Nosotros».
 *
 * No copia el documento: toma las cuatro frases de su resumen —las mismas
 * que abren la página de términos, así que no pueden desfasarse— y enlaza al
 * texto completo. Quien mira los datos legales de una agencia quiere saber
 * además qué pasa si reserva, paga o cancela; aquí lo ve sin salir.
 */
export async function TransparenciaLegal({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "about.transparency" });
  const ajustes = await getAjustes();
  const terminos = crearTerminos(ajustes);

  return (
    <div className="mt-12 overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-4">
          <span className="inline-grid size-11 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/25">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-heading text-xl font-bold uppercase text-white">{t("title")}</h3>
            <p className="mt-0.5 text-sm text-slate-400">{t("subtitle")}</p>
          </div>
        </div>
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <BadgeCheck className="size-4 text-teal-300" aria-hidden />
          {terminos.updated[locale]}
        </p>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
        {terminos.resumen.map((frase, i) => {
          const Icon = ICONOS[i] ?? FileCheck2;
          return (
            <li
              key={i}
              className="group flex gap-3 border-white/10 px-6 py-6 transition-colors duration-300 hover:bg-white/[0.04] sm:px-8 max-sm:[&:not(:last-child)]:border-b sm:max-lg:[&:nth-child(-n+2)]:border-b sm:max-lg:[&:nth-child(odd)]:border-r lg:[&:not(:last-child)]:border-r"
            >
              <Icon
                className="mt-0.5 size-5 shrink-0 text-amber-400 transition-transform duration-300 group-hover:-translate-y-0.5"
                aria-hidden
              />
              <p className="text-sm leading-relaxed text-slate-300">{frase[locale]}</p>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
        <Link
          href="/legal/terminos"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-slate-950 transition-colors hover:bg-amber-400"
        >
          {t("terms")}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
        <Link
          href="/legal/privacidad"
          className="inline-flex items-center justify-center gap-2 px-2 py-2 text-sm font-semibold text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          {t("privacy")}
        </Link>
      </div>
    </div>
  );
}
