"use client";

import { supabase } from "@/lib/supabase";

const DEPOSITO = "medios";

/* Ancho máximo. La foto más grande que muestra la web es la cabecera de la
   ficha de tour, y ahí caben 1600px de sobra incluso en pantallas Retina.
   Guardar más solo hace la página más lenta. */
const ANCHO_MAX = 1600;
const CALIDAD = 0.82;

export interface ResultadoSubida {
  url: string;
  bytesOriginal: number;
  bytesFinal: number;
}

/**
 * Reduce la imagen antes de subirla.
 *
 * Una foto de móvil ronda los 4-8 MB y 4000px de ancho. Subirla tal cual
 * llenaría el almacén y, sobre todo, obligaría a cada visitante a
 * descargarla entera: en la web publicada las imágenes van sin optimizar
 * (`unoptimized: true`, porque el export estático no lleva servidor que las
 * procese), así que lo que se sube es literalmente lo que se descarga.
 *
 * Se convierte a WebP, que pesa alrededor de un tercio que el JPEG a igual
 * calidad y lo entienden todos los navegadores desde 2020.
 */
async function reducir(archivo: File): Promise<Blob> {
  /* Los animados se dejan intactos: pasarlos por el lienzo los congelaría
     en el primer fotograma. */
  if (archivo.type === "image/gif") return archivo;

  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, ANCHO_MAX / bitmap.width);
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) return archivo;
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((r) =>
    lienzo.toBlob(r, "image/webp", CALIDAD)
  );
  /* Si el navegador no sabe generar WebP devuelve null: se sube el original
     antes que dejar al usuario sin poder subir nada. */
  return blob ?? archivo;
}

function nombreLimpio(nombre: string): string {
  return nombre
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "imagen";
}

/**
 * Sube una imagen y devuelve su dirección pública.
 *
 * El nombre lleva marca de tiempo para que subir dos veces la misma foto no
 * pise la anterior: si un tour ya publicado apunta a ella, se quedaría sin
 * imagen sin que nadie se enterase.
 */
export async function subirImagen(
  archivo: File,
  carpeta: string
): Promise<ResultadoSubida> {
  if (!supabase) throw new Error("Supabase no está configurado.");

  const blob = await reducir(archivo);
  const extension = blob.type === "image/webp" ? "webp" : archivo.name.split(".").pop() || "jpg";
  const ruta = `${carpeta}/${Date.now()}-${nombreLimpio(archivo.name)}.${extension}`;

  const { error } = await supabase.storage.from(DEPOSITO).upload(ruta, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
  });

  if (error) {
    /* El mensaje crudo de Supabase para esto es "new row violates row-level
       security policy", que no le dice nada a quien está subiendo una foto. */
    if (/row-level security|Unauthorized/i.test(error.message)) {
      throw new Error(
        "Tu cuenta no tiene permiso para subir imágenes. Falta ejecutar 003_almacenamiento.sql."
      );
    }
    if (/Bucket not found/i.test(error.message)) {
      throw new Error(
        "No existe el almacén de imágenes. Ejecuta 003_almacenamiento.sql en Supabase."
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(DEPOSITO).getPublicUrl(ruta);
  return { url: data.publicUrl, bytesOriginal: archivo.size, bytesFinal: blob.size };
}

export function formatearPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
