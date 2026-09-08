"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EQUIPO, type MiembroEquipo } from "@/data/equipo";
import { colorDeArea, ordenDeArea } from "@/config/areas";



/**
 * Agrupa por área respetando el orden de la lista de configuración, y deja
 * al final las áreas escritas a mano que no estén en ella.
 *
 * Se agrupa, y no se pinta todo en una rejilla seguida, porque con equipos
 * de cierto tamaño una cuadrícula de doce caras sin separar no dice quién
 * hace qué. Con un rótulo por área, se lee de un vistazo.
 */
function porAreas(miembros: MiembroEquipo[]) {
  const mapa = new Map<string, MiembroEquipo[]>();
  for (const m of miembros) {
    const area = m.area?.trim() || "";
    if (!mapa.has(area)) mapa.set(area, []);
    mapa.get(area)!.push(m);
  }
  return [...mapa.entries()]
    .map(([area, gente]) => ({ area, gente }))
    .sort((a, b) => ordenDeArea(a.area) - ordenDeArea(b.area));
}

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

        {porAreas(TEAM).map((grupo, g) => (
          <section key={grupo.area || `sin-area-${g}`} className="mt-16">
            {/* El rótulo del área solo aparece si hay más de un área. Con
                todo el equipo en una sola, un único encabezado repetido
                encima de la rejilla no separa nada: solo estorba. */}
            {/* Rótulo centrado con su filete a cada lado, en vez de pegado
                a la izquierda: los grupos suelen tener una o dos personas y
                una etiqueta en la esquina de una fila casi vacía se lee
                descolgada. */}
            {grupo.area && porAreas(TEAM).length > 1 && (
              <div className="mb-9 flex items-center gap-5">
                <span aria-hidden className="h-px flex-1 bg-slate-200" />
                <h3
                  className={`shrink-0 rounded-full px-4 py-1.5 font-heading text-sm font-bold uppercase tracking-[0.12em] ${colorDeArea(grupo.area).color} ${colorDeArea(grupo.area).fondo}`}
                >
                  {grupo.area}
                </h3>
                <span aria-hidden className="h-px flex-1 bg-slate-200" />
              </div>
            )}

            {/* Centrado y con ancho por ficha en lugar de rejilla de tres
                columnas fijas. Con la rejilla, un área de una sola persona
                dejaba esa ficha pegada a la izquierda y dos tercios de fila
                vacíos; así queda siempre en medio, y con tres o más se
                comporta igual que antes. */}
            <div className="flex flex-wrap justify-center gap-8">
          {grupo.gente.map((member, index) => {
            const departmentStyle = colorDeArea(member.area);
            return (
              <div
                key={member.nombre}
                className={`group relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-xl hover:ring-slate-200 sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] scroll-animate ${
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
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${departmentStyle.color} ${departmentStyle.fondo}`}>
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
          </section>
        ))}
      </div>
    </section>
  );
}