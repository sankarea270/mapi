import { mailAt, siteConfig } from "@/config/site";

/**
 * Equipo, como respaldo del repositorio.
 *
 * Lo que se ve en la web sale de la tabla `team_members` de Supabase,
 * editable desde el panel. Esto es lo que se usa si Supabase no está
 * configurado, no responde o está vacío.
 *
 * AVISO: estas seis fichas son de relleno —nombres inventados, retratos de
 * banco de imágenes y teléfonos que no existen—. Estaban escritas dentro del
 * componente desde el principio. En cuanto se cargue el equipo real en el
 * panel dejan de verse; conviene hacerlo, porque un visitante puede intentar
 * llamar a esos números.
 */
export interface MiembroEquipo {
  nombre: string;
  cargo: string;
  area: string;
  foto: string;
  correo: string;
  telefono: string;
  /** Idiomas que habla. Vacío en las de relleno. */
  idiomas?: string;
}

export const EQUIPO: MiembroEquipo[] = [
  {
    nombre: "Carlos Mendoza",
    cargo: "Gerente General",
    area: "Administración",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    correo: mailAt("carlos"),
    telefono: siteConfig.phone.display
  },
  {
    nombre: "Ana Quispe",
    cargo: "Jefa de Operaciones",
    area: "Operaciones",
    foto: "https://images.unsplash.com/photo-1494790108755-2616b612b999?w=400&h=400&fit=crop&crop=face",
    correo: mailAt("ana"),
    telefono: "+51 984 123 457"
  },
  {
    nombre: "Miguel Torres",
    cargo: "Guía Senior",
    area: "Guías",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    correo: mailAt("miguel"),
    telefono: "+51 984 123 458"
  },
  {
    nombre: "Rosa Huamán",
    cargo: "Ejecutiva de Ventas",
    area: "Ventas",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    correo: mailAt("rosa"),
    telefono: "+51 984 123 459"
  },
  {
    nombre: "Pedro Ccama",
    cargo: "Guía Especializado",
    area: "Guías",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    correo: mailAt("pedro"),
    telefono: "+51 984 123 460"
  },
  {
    nombre: "Lucia Vargas",
    cargo: "Coordinadora de Tours",
    area: "Operaciones",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    correo: mailAt("lucia"),
    telefono: "+51 984 123 461"
  }
];
