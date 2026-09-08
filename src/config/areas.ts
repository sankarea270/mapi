/**
 * Áreas del equipo, con su color.
 *
 * Vive en `config` y no dentro de un componente porque la lista la usan dos
 * sitios que no se conocen: la página "Nosotros", para pintar la etiqueta y
 * agrupar las fichas, y el panel de administración, para ofrecerlas al
 * añadir a alguien. Tenerla duplicada garantizaba que un día dejaran de
 * coincidir y alguien eligiera en el panel un área que la web no sabe
 * colorear.
 *
 * El orden es el que se usa para agrupar en la página: primero quien
 * atiende al viajero, después quien sostiene la operación por detrás.
 *
 * Las clases van escritas enteras a propósito. Tailwind lee el código como
 * texto para decidir qué CSS genera, así que un `text-${color}-600` armado
 * a trozos no llegaría a existir en la hoja de estilos.
 */
export interface Area {
  nombre: string;
  color: string;
  fondo: string;
}

export const AREAS: Area[] = [
  { nombre: "Guías", color: "text-emerald-700", fondo: "bg-emerald-50" },
  { nombre: "Ventas", color: "text-rose-700", fondo: "bg-rose-50" },
  { nombre: "Reservas", color: "text-teal-700", fondo: "bg-teal-50" },
  { nombre: "Atención al viajero", color: "text-sky-700", fondo: "bg-sky-50" },
  { nombre: "Operaciones", color: "text-blue-700", fondo: "bg-blue-50" },
  { nombre: "Transporte", color: "text-orange-700", fondo: "bg-orange-50" },
  { nombre: "Marketing", color: "text-fuchsia-700", fondo: "bg-fuchsia-50" },
  { nombre: "Tecnología", color: "text-violet-700", fondo: "bg-violet-50" },
  { nombre: "Administración", color: "text-amber-700", fondo: "bg-amber-50" },
  { nombre: "Dirección", color: "text-slate-700", fondo: "bg-slate-100" },
];

/** Reserva para un área escrita a mano que no esté en la lista. */
export const AREA_SIN_COLOR: Omit<Area, "nombre"> = {
  color: "text-slate-600",
  fondo: "bg-slate-100",
};

export function colorDeArea(nombre: string | null | undefined) {
  return AREAS.find((a) => a.nombre === nombre) ?? AREA_SIN_COLOR;
}

/** Posición para ordenar; las de fuera de la lista van al final. */
export function ordenDeArea(nombre: string | null | undefined): number {
  const i = AREAS.findIndex((a) => a.nombre === nombre);
  return i === -1 ? AREAS.length : i;
}
