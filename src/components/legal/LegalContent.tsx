import type { AppLocale } from "@/i18n/routing";
import { TERMS, PRIVACY, type LegalDocument } from "@/data/legal";

export function LegalContent({ doc, locale }: { doc: LegalDocument; locale: AppLocale }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-10">
      <p className="text-sm font-medium text-slate-500">{doc.updated[locale]}</p>
      <p className="mt-4 text-base leading-relaxed text-slate-600">{doc.intro[locale]}</p>
      <div className="mt-8 space-y-8">
        {doc.sections.map((section, index) => (
          <section key={index}>
            <h2 className="font-heading text-lg font-bold text-slate-900">{section.heading[locale]}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.body[locale]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export { TERMS, PRIVACY };