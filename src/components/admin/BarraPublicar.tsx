"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Boton } from "./campos";

const CLAVE = "gotomapi-cambios-sin-publicar";

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

    const { error } = await supabase.functions.invoke("publicar");

    if (error) {
      setEstado("error");
      setDetalle(
        "No se pudo avisar a GitHub. Comprueba que la función `publicar` está desplegada, " +
          "o lanza el despliegue a mano desde la pestaña Actions del repositorio."
      );
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
        <p role="alert" className="max-w-xs text-xs leading-relaxed text-red-600">
          {detalle}
        </p>
      )}
    </div>
  );
}
