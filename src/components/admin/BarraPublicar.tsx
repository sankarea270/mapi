"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Boton } from "./campos";

const CLAVE = "gotomapi-cambios-sin-publicar";

/* Salida de emergencia: el mismo despliegue se puede lanzar a mano desde
   aquí. No es un secreto —quien no tenga acceso al repositorio verá un 404—
   y es lo único que desatasca al que se encuentra el botón roto. */
const ACCIONES = "https://github.com/sankarea270/mapi/actions/workflows/deploy-cpanel.yml";

/*
 * Nombres con los que buscar la función, en orden.
 *
 * El primero es el que le corresponde. El segundo es el identificador que
 * generó solo el editor del panel de Supabase: ahí el nombre que se escribe
 * es una etiqueta, y la URL se queda con un nombre inventado. Se probó y la
 * función respondía correctamente en `hyper-handler` mientras `publicar`
 * daba 404.
 *
 * Se intentan los dos en vez de fijar el que hay hoy porque, si algún día se
 * vuelve a desplegar con el nombre correcto, esto sigue funcionando sin tocar
 * nada. Solo hay una llamada de más cuando la primera no existe.
 */
const NOMBRES = ["publicar", "hyper-handler"];

/**
 * Traduce el fallo a algo accionable.
 *
 * `functions.invoke` devuelve un error casi mudo: sin esto, un 404 —la
 * función nunca se desplegó— y un 403 —la cuenta no es administradora— se
 * ven exactamente igual, y son problemas completamente distintos. El 404 es
 * además el caso más probable, porque desplegar la función es un paso aparte
 * que se hace una sola vez y es fácil que se quede pendiente.
 */
async function explicar(error: unknown): Promise<string> {
  const respuesta = (error as { context?: Response })?.context;
  const codigo = respuesta?.status;

  if (codigo === 404) {
    return (
      "No se encuentra la función en Supabase, ni como `publicar` ni como " +
      "`hyper-handler`. Comprueba en Edge Functions con qué nombre quedó la URL. " +
      "Mientras tanto, usa el enlace de abajo."
    );
  }
  if (codigo === 401) return "Tu sesión ha caducado. Vuelve a entrar.";
  if (codigo === 403) return "Esta cuenta no está en la tabla `admins` de Supabase.";

  if (codigo === 500) {
    /* El cuerpo de la función dice cuál de los dos secretos falta; leerlo
       ahorra tener que abrir los registros de Supabase. */
    try {
      const cuerpo = await respuesta!.clone().json();
      if (typeof cuerpo?.error === "string") return cuerpo.error;
    } catch {
      /* Sin cuerpo legible: se queda el mensaje genérico. */
    }
  }
  if (codigo === 502) {
    return "GitHub rechazó la petición. Suele ser el token: caducado o sin permiso sobre el repositorio.";
  }
  return "No se pudo avisar a GitHub. Usa el enlace de abajo para lanzarlo a mano.";
}

/**
 * Botón de publicar.
 *
 * La web es HTML estático generado al compilar, así que guardar en Supabase
 * no cambia nada de lo que ve el visitante: hay que reconstruir el sitio y
 * volver a subirlo. Esto lanza ese proceso.
 *
 * La orden no sale del navegador. Va a una función de Supabase que comprueba
 * que quien llama es administrador y solo entonces avisa a GitHub Actions,
 * usando un token que vive en el servidor. Meter ese token en el JavaScript
 * del panel equivaldría a publicarlo: cualquiera podría lanzar despliegues.
 */
export function BarraPublicar({ revision }: { revision: number }) {
  const [pendientes, setPendientes] = useState(0);
  const [estado, setEstado] = useState<"quieto" | "enviando" | "lanzado" | "error">("quieto");
  const [detalle, setDetalle] = useState("");

  /* El contador sobrevive a una recarga: si guardaste algo y cerraste la
     pestaña, al volver el panel sigue recordándote que falta publicar. */
  useEffect(() => {
    try {
      setPendientes(Number(localStorage.getItem(CLAVE) ?? 0));
    } catch {
      /* Modo privado o cookies bloqueadas: el contador se queda en la sesión. */
    }
  }, []);

  useEffect(() => {
    if (revision === 0) return;
    setPendientes((n) => {
      const siguiente = n + 1;
      try {
        localStorage.setItem(CLAVE, String(siguiente));
      } catch {
        /* Sin almacenamiento: el aviso vale solo mientras la pestaña siga abierta. */
      }
      return siguiente;
    });
    setEstado("quieto");
  }, [revision]);

  async function publicar() {
    if (!supabase) return;
    setEstado("enviando");
    setDetalle("");

    let ultimo: unknown = null;
    for (const nombre of NOMBRES) {
      const { error } = await supabase.functions.invoke(nombre);
      if (!error) {
        ultimo = null;
        break;
      }
      ultimo = error;
      /* Solo se sigue probando si es que NO existe. Un 403 o un 500 son
         respuestas de la función buena: insistir con otro nombre solo
         cambiaría un error certero por un "no encontrada" que despista. */
      const codigo = (error as { context?: Response })?.context?.status;
      if (codigo !== 404) break;
    }

    if (ultimo) {
      setEstado("error");
      setDetalle(await explicar(ultimo));
      return;
    }

    setEstado("lanzado");
    setPendientes(0);
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      /* Nada que limpiar si no hubo dónde guardar. */
    }
  }

  return (
    <div className="flex items-center gap-3">
      {pendientes > 0 && estado !== "lanzado" && (
        <span className="hidden text-xs text-slate-500 sm:inline">
          {pendientes} {pendientes === 1 ? "cambio" : "cambios"} sin publicar
        </span>
      )}

      {estado === "lanzado" ? (
        <span className="text-xs font-semibold text-teal-700">
          Publicando… la web se actualiza en unos 3 minutos.
        </span>
      ) : (
        <Boton
          onClick={publicar}
          disabled={estado === "enviando" || pendientes === 0}
          variante={pendientes > 0 ? "primario" : "neutro"}
        >
          {estado === "enviando" ? "Enviando…" : "Publicar cambios"}
        </Boton>
      )}

      {estado === "error" && (
        <div role="alert" className="max-w-xs text-xs leading-relaxed text-red-600">
          <p>{detalle}</p>
          <a
            href={ACCIONES}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block font-semibold underline underline-offset-2"
          >
            Lanzar el despliegue a mano →
          </a>
        </div>
      )}
    </div>
  );
}
