"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EQUIPO, type MiembroEquipo } from "@/data/equipo";



const DEPARTMENTS = {
  "Administración": { color: "text-amber-600", bgColor: "bg-amber-50" },
  "Operaciones": { color: "text-blue-600", bgColor: "bg-blue-50" },
  "Guías": { color: "text-emerald-600", bgColor: "bg-emerald-50" },
  "Ventas": { color: "text-rose-600", bgColor: "bg-rose-50" }
};

/**
 * El equipo llega desde arriba, leído de Supabase al compilar. Antes estaba
 * escrito aquí dentro con datos inventados.
 */
export function TeamSection({ miembros }: { miembros?: MiembroEquipo[] }) {
  const TEAM = miembros?.length ? miembros : EQUIPO;

  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-2xl text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <h2 className="font-heading text-4xl font-bold text-slate-900 sm:text-5xl">
            {t("team.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {t("team.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member, index) => {
            /* Las áreas se escriben a mano en el panel, así que puede
               llegar una que no esté en el mapa de colores. Sin reserva,
               la etiqueta salía con `undefined` de clase: texto negro sobre
               fondo transparente, o sea sin etiqueta. */
            const departmentStyle =
              DEPARTMENTS[member.area as keyof typeof DEPARTMENTS] ?? {
                color: "text-slate-600",
                bgColor: "bg-slate-100",
              };
            return (
              <div
                key={member.nombre}
                className={`group relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-xl hover:ring-slate-200 scroll-animate ${
                  isVisible ? `animate-fade-in-up delay-${(index + 1) * 100}` : ""
                }`}
              >
                {/* Efecto de gradiente al hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Imagen con efecto hover */}
                <div className="relative mx-auto size-24 overflow-hidden rounded-full ring-4 ring-white shadow-lg transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src={member.foto}
                    alt={member.nombre}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Información del miembro */}
                <div className="relative mt-6">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    {member.nombre}
                  </h3>
                  <p className="mt-1 font-semibold text-slate-700">
                    {member.cargo}
                  </p>
                  {member.area && (
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${departmentStyle.color} ${departmentStyle.bgColor}`}>
                      {member.area}
                    </span>
                  )}
                  {member.idiomas && (
                    <p className="mt-2 text-xs text-slate-500">{member.idiomas}</p>
                  )}
                </div>

                {/* Información de contacto (visible al hover) */}
                <div className="relative mt-4 opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    {member.correo && (
                    <a
                      href={`mailto:${member.correo}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
                    >
                      <Mail className="size-4" />
                      <span className="truncate">{member.correo}</span>
                    </a>
                    )}
                    {member.telefono && (
                    <a
                      href={`tel:${member.telefono}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
                    >
                      <Phone className="size-4" />
                      <span>{member.telefono}</span>
                    </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}