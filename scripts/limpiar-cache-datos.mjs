/*
 * Borra las respuestas de Supabase guardadas por Next antes de compilar.
 *
 * Next guarda en `.next/cache/fetch-cache` lo que devuelven las peticiones
 * hechas al compilar, y en la siguiente compilación las reutiliza en vez de
 * volver a pedirlas. Para una web que se genera ENTERA a partir de la base de
 * datos eso es justo lo contrario de lo que se quiere: se encontraron reseñas
 * guardadas dos días antes, de antes de corregir sus enlaces, y la portada
 * se compilaba con los datos viejos aunque Supabase ya tuviera los nuevos.
 *
 * El despliegue de GitHub empieza cada vez en una máquina limpia y no se veía
 * afectado; esto hace que una compilación local tampoco lo esté, y que siga
 * sin estarlo si algún día se cachea la carpeta `.next`.
 *
 * No se toca el resto de `.next/cache` (la compilación de código), que sí
 * conviene reutilizar.
 */
import { rmSync } from "node:fs";

rmSync(".next/cache/fetch-cache", { recursive: true, force: true });
console.log("Caché de datos de Supabase borrada: se compila con los datos actuales.");
