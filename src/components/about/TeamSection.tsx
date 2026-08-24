"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TEAM = [
  {
    name: "Carlos Mendoza",
    position: "Gerente General",
    department: "Administración",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    email: "carlos@mapitravels.pe",
    phone: "+51 984 123 456"
  },
  {
    name: "Ana Quispe",
    position: "Jefa de Operaciones",
    department: "Operaciones",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b999?w=400&h=400&fit=crop&crop=face",
    email: "ana@mapitravels.pe",
    phone: "+51 984 123 457"
  },
  {
    name: "Miguel Torres",
    position: "Guía Senior",
    department: "Guías",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    email: "miguel@mapitravels.pe",
    phone: "+51 984 123 458"
  },
  {
    name: "Rosa Huamán",
    position: "Ejecutiva de Ventas",
    department: "Ventas",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    email: "rosa@mapitravels.pe",
    phone: "+51 984 123 459"
  },
  {
    name: "Pedro Ccama",
    position: "Guía Especializado",
    department: "Guías",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    email: "pedro@mapitravels.pe",
    phone: "+51 984 123 460"
  },
  {
    name: "Lucia Vargas",
    position: "Coordinadora de Tours",
    department: "Operaciones",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    email: "lucia@mapitravels.pe",
    phone: "+51 984 123 461"
  }
];

const DEPARTMENTS = {
  "Administración": { color: "text-amber-600", bgColor: "bg-amber-50" },
  "Operaciones": { color: "text-blue-600", bgColor: "bg-blue-50" },
  "Guías": { color: "text-emerald-600", bgColor: "bg-emerald-50" },
  "Ventas": { color: "text-rose-600", bgColor: "bg-rose-50" }
};

export function TeamSection() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-2xl text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t("team.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {t("team.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member, index) => {
            const departmentStyle = DEPARTMENTS[member.department as keyof typeof DEPARTMENTS];
            return (
              <div
                key={member.name}
                className={`group relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-xl hover:ring-slate-200 scroll-animate ${
                  isVisible ? `animate-fade-in-up delay-${(index + 1) * 100}` : ""
                }`}
              >
                {/* Efecto de gradiente al hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Imagen con efecto hover */}
                <div className="relative mx-auto size-24 overflow-hidden rounded-full ring-4 ring-white shadow-lg transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Información del miembro */}
                <div className="relative mt-6">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="mt-1 font-semibold text-slate-700">
                    {member.position}
                  </p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${departmentStyle?.color} ${departmentStyle?.bgColor}`}>
                    {member.department}
                  </span>
                </div>

                {/* Información de contacto (visible al hover) */}
                <div className="relative mt-4 opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
                    >
                      <Mail className="size-4" />
                      <span className="truncate">{member.email}</span>
                    </a>
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
                    >
                      <Phone className="size-4" />
                      <span>{member.phone}</span>
                    </a>
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