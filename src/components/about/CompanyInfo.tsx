"use client";

import { Building2, FileText, Briefcase, Badge } from "lucide-react";
import { useTranslations } from "next-intl";
import { mailAt, siteConfig } from "@/config/site";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const COMPANY_DATA = [
  {
    icon: Building2,
    key: "businessName",
    value: "MAPI TRAVELS TOUR OPERATOR E.I.R.L.",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: FileText,
    key: "ruc",
    value: "20491103753",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: Briefcase,
    key: "activity",
    value: "Agencia de viajes y operador turístico",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: Badge,
    key: "license",
    value: "002059-2012",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  }
];

const ADDITIONAL_INFO = [
  {
    key: "authorization",
    value: "301-2012"
  },
  {
    key: "address",
    value: "Av. El Sol 123, Cusco - Perú"
  },
  {
    key: "phone",
    /* De la configuración, no escrito aquí: tenerlo en tres sitios
       garantizaba que un cambio de número dejara alguno desfasado. */
    value: siteConfig.phone.display
  },
  {
    key: "email",
    value: mailAt("info")
  }
];

export function CompanyInfo() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-slate-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-2xl text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t("companyInfo.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            {t("companyInfo.subtitle")}
          </p>
        </div>

        {/* Información principal */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANY_DATA.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm p-6 text-center ring-1 ring-white/10 transition-all duration-500 hover:bg-white/10 hover:ring-white/20 scroll-animate ${
                  isVisible ? `animate-fade-in-up delay-${(index + 1) * 100}` : ""
                }`}
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
                
                <div className={`mx-auto inline-flex size-12 items-center justify-center rounded-lg ${item.bgColor} transition-transform duration-500 group-hover:scale-110`}>
                  <Icon className={`size-6 ${item.color}`} strokeWidth={2.5} />
                </div>
                
                <h3 className="mt-4 font-semibold text-white">
                  {t(`companyInfo.${item.key}.label`)}
                </h3>
                <p className="mt-2 text-sm text-slate-300 font-mono">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className={`mt-12 rounded-2xl bg-white/5 backdrop-blur-sm p-8 ring-1 ring-white/10 scroll-animate ${isVisible ? "animate-fade-in-up delay-500" : ""}`}>
          <h3 className="font-heading text-xl font-bold text-white mb-6">
            {t("companyInfo.additional.title")}
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {ADDITIONAL_INFO.map((info, index) => (
              <div key={info.key} className="flex items-start gap-3">
                <div className="mt-1 size-2 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <dt className="text-sm font-semibold text-slate-300">
                    {t(`companyInfo.${info.key}.label`)}:
                  </dt>
                  <dd className="text-sm text-white font-mono">
                    {info.value}
                  </dd>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nota legal */}
        <div className={`mt-8 text-center scroll-animate ${isVisible ? "animate-fade-in delay-600" : ""}`}>
          <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {t("companyInfo.legalNote")}
          </p>
        </div>
      </div>
    </section>
  );
}