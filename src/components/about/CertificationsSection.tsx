import { getTranslations } from "next-intl/server";
import { Credentials } from "@/components/about/Credentials";

/**
 * Sección de avales de la página "Nosotros".
 *
 * Antes mostraba cuatro iconos genéricos de librería —Gem, Star, Medal— como
 * marcador de posición de MINCETUR, DIRCETUR, Marca Perú y SERNANP. Un icono
 * inventado en lugar del sello oficial no acredita nada; ahora se usan los
 * logos reales.
 *
 * SERNANP ya no aparece: no hay logo para ese organismo entre los aportados,
 * y era preferible retirarlo antes que dejar un icono simulando un aval.
 */
export async function CertificationsSection({ locale }: { locale: string }) {
  const t = await getTranslations("about");

  return (
    <section className="border-t border-slate-200 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.6rem] sm:leading-[1.1]">
            {t("certifications.title")}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
            {t("certifications.subtitle")}
          </p>
        </div>

        <div className="mt-14">
          <Credentials variant="grid" locale={locale} />
        </div>

        <p className="mt-14 max-w-3xl border-l-2 border-teal-600 pl-6 text-[15px] leading-relaxed text-slate-600">
          {t("certifications.description")}
        </p>
      </div>
    </section>
  );
}
