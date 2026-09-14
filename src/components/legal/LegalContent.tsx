import { ArrowRight, Check, Mail, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { enlaceWhatsapp } from "@/config/ajustes";
import { getAjustes } from "@/lib/content";
import { FichaSecciones } from "@/components/tours/FichaSecciones";
import { crearPrivacidad, crearTerminos, type LegalDocument } from "@/data/legal";

/**
 * Página de un documento legal, con el mismo formato que las fichas de tour.
 *
 * Antes era un bloque de texto gris en una tarjeta blanca, con encabezados
 * de 18px: se leía como la letra pequeña que nadie abre. Aquí se trata como
 * lo que debería ser, un documento que se consulta: arriba lo esencial en
 * cuatro frases, un índice clavado que sigue la lectura —el mismo de las
 * fichas— y cada cláusula con su número, porque en un texto legal las
 * cláusulas se citan («según la cláusula 5…») y el número es información.
 *
 * Al lado, a quién preguntar. Quien lee unos términos suele tener una duda
 * concreta, y la respuesta rápida es escribir, no seguir leyendo.
 */
export async function LegalContent({
  doc,
  locale,
  otro,
}: {
  doc: LegalDocument;
  locale: AppLocale;
  /** El otro documento legal, para enlazarlo. */
  otro: { href: string; doc: LegalDocument };
}) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const ajustes = await getAjustes();
  const empresa = ajustes;

  const secciones = doc.sections.map((s, i) => ({
    id: s.id,
    label: s.corto[locale],
    icon: (
      <span className="font-heading text-[12px] font-bold tabular-nums">
        {String(i + 1).padStart(2, "0")}
      </span>
    ),
  }));

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-600">
            {doc.badge[locale]}
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold uppercase leading-[0.95] text-slate-900 sm:text-5xl lg:text-6xl">
            {doc.title[locale]}
          </h1>
          <p className="mt-6 max-w-2xl font-logo text-lg leading-relaxed text-slate-600 sm:text-xl">
            {doc.intro[locale]}
          </p>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span>{doc.updated[locale]}</span>
            <span aria-hidden className="h-3 w-px bg-slate-300" />
            <span>{empresa.razonSocial}</span>
            <span aria-hidden className="h-3 w-px bg-slate-300" />
            <span className="tabular-nums">RUC {empresa.ruc}</span>
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {/* Lo esencial, antes que el texto completo. */}
            <section
              aria-labelledby="resumen-legal"
              className="rounded-lg bg-white p-6 ring-1 ring-slate-200 sm:p-8"
            >
              <h2
                id="resumen-legal"
                className="font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-teal-700"
              >
                {t("summary")}
              </h2>
              <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {doc.resumen.map((frase, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
                    <Check className="mt-1 size-4 shrink-0 text-teal-600" aria-hidden />
                    {frase[locale]}
                  </li>
                ))}
              </ul>
            </section>

            <FichaSecciones className="mt-8" ariaLabel={t("index")} secciones={secciones} />

            {doc.sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-[calc(var(--alto-cabecera,8.25rem)+5.5rem)] border-t border-slate-200 py-10 first-of-type:border-t-0 sm:py-12"
              >
                <p className="font-heading text-[13px] font-bold tabular-nums tracking-[0.14em] text-amber-600">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1.5 font-heading text-2xl font-bold text-slate-900 sm:text-[1.7rem]">
                  {s.titulo[locale]}
                </h2>

                <div className="mt-5 max-w-[68ch] space-y-4">
                  {s.bloques.map((b, k) =>
                    b.tipo === "p" ? (
                      <p key={k} className="text-[15.5px] leading-[1.75] text-slate-700">
                        {b.texto[locale]}
                      </p>
                    ) : (
                      <ul key={k} className="space-y-2.5">
                        {b.items.map((item, j) => (
                          <li key={j} className="flex gap-3 text-[15.5px] leading-[1.7] text-slate-700">
                            <span
                              aria-hidden
                              className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-teal-600"
                            />
                            {item[locale]}
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--alto-cabecera,8.25rem)+1.25rem)] lg:self-start">
            <div className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
              <div className="bg-slate-900 px-6 py-5">
                <p className="font-heading text-lg font-bold text-white">{t("questions")}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{t("questionsText")}</p>
              </div>
              <div className="space-y-3 p-6">
                <a
                  href={enlaceWhatsapp(ajustes, t("whatsappMessage", { doc: doc.title[locale] }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  {t("whatsapp")}
                </a>
                <a
                  href={`mailto:${ajustes.correo}`}
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-teal-700"
                >
                  <Mail className="size-4" aria-hidden />
                  {ajustes.correo}
                </a>
              </div>
            </div>

            <Link
              href={otro.href}
              className="group flex items-center justify-between gap-3 rounded-lg bg-white px-6 py-4 ring-1 ring-slate-200 transition-colors hover:ring-teal-600"
            >
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {t("otherDoc")}
                </span>
                <span className="mt-1 block font-heading text-base font-bold text-slate-900">
                  {otro.doc.title[locale]}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-teal-700 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export { crearPrivacidad, crearTerminos };
