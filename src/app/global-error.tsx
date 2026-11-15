"use client";

import { useEffect, useState } from "react";

/*
 * Pantalla de error de toda la web.
 *
 * No existía ninguna, así que cualquier fallo en el navegador dejaba la
 * página en blanco con el aviso de Next en inglés: «Application error: a
 * client-side exception has occurred». Pasó el 15-nov-2026 al publicar.
 *
 * El caso más común es que alguien tenga la web abierta mientras se publica
 * una versión nueva: su página pide un JavaScript de la versión anterior y
 * ya no está (o todavía no está). Eso se arregla recargando, así que se
 * recarga sola, UNA vez: si el fallo vuelve en menos de un minuto no es de
 * versiones y recargar en bucle dejaría la pestaña inservible. Para el resto
 * de fallos se explica qué pasa y se ofrece recargar o volver al inicio.
 *
 * Los textos van aquí y no en messages/*.json porque esta pantalla sustituye
 * al layout entero, y con él al proveedor de traducciones: si fallara lo que
 * carga los textos, no habría con qué enseñar el error.
 */

type Idioma = "es" | "en" | "pt";

const TEXTOS: Record<Idioma, { titulo: string; cuerpo: string; nueva: string; recargar: string; inicio: string }> = {
  es: {
    titulo: "Algo no cargó bien",
    cuerpo: "La página tuvo un problema al abrirse. Recárgala; si sigue igual, vuelve al inicio o escríbenos por WhatsApp.",
    nueva: "Hay una versión nueva de la web. Recargando…",
    recargar: "Recargar la página",
    inicio: "Ir al inicio",
  },
  en: {
    titulo: "Something didn't load properly",
    cuerpo: "The page ran into a problem while opening. Reload it; if it keeps happening, go back to the home page or message us on WhatsApp.",
    nueva: "There is a new version of the site. Reloading…",
    recargar: "Reload the page",
    inicio: "Go to the home page",
  },
  pt: {
    titulo: "Algo não carregou bem",
    cuerpo: "A página teve um problema ao abrir. Recarregue; se continuar igual, volte ao início ou fale conosco pelo WhatsApp.",
    nueva: "Há uma versão nova do site. Recarregando…",
    recargar: "Recarregar a página",
    inicio: "Ir para o início",
  },
};

const CLAVE = "gotomapi-recarga-por-version";

function idiomaDeLaRuta(): Idioma {
  const primero = window.location.pathname.split("/")[1];
  return primero === "en" || primero === "pt" ? primero : "es";
}

/* Los mensajes con los que cada navegador dice «no encuentro ese JS». */
function esDeVersion(error: Error): boolean {
  return (
    error?.name === "ChunkLoadError" ||
    /Loading (CSS )?chunk|dynamically imported module|Importing a module script failed|error loading dynamically/i.test(
      error?.message ?? ""
    )
  );
}

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  const [idioma, setIdioma] = useState<Idioma>("es");
  const [recargando, setRecargando] = useState(false);

  useEffect(() => {
    setIdioma(idiomaDeLaRuta());
    console.error(error);
    if (!esDeVersion(error)) return;
    try {
      const ultima = Number(sessionStorage.getItem(CLAVE) ?? 0);
      if (Date.now() - ultima > 60_000) {
        sessionStorage.setItem(CLAVE, String(Date.now()));
        setRecargando(true);
        window.location.reload();
      }
    } catch {
      /* Sin sessionStorage no hay forma de saber si ya se recargó: mejor
         dejar el botón que arriesgarse a un bucle. */
    }
  }, [error]);

  const t = TEXTOS[idioma];

  /* Estilos en línea: esta pantalla no puede contar con la hoja de estilos
     de la web, que carga el layout al que sustituye. Colores de la marca:
     el petróleo del logo y el naranja. */
  return (
    <html lang={idioma}>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "24px 16px",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <main style={{ maxWidth: 440, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>
            GoTo<span style={{ color: "#d88527" }}>Mapi</span>
          </p>
          <h1 style={{ margin: "28px 0 0", fontSize: 26, lineHeight: 1.2 }}>
            {recargando ? t.nueva : t.titulo}
          </h1>
          {!recargando && (
            <>
              <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.6, color: "#475569" }}>{t.cuerpo}</p>
              <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  style={{
                    minHeight: 44,
                    padding: "0 22px",
                    border: 0,
                    borderRadius: 6,
                    background: "#036564",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t.recargar}
                </button>
                <a
                  href={`/${idioma}/`}
                  style={{
                    minHeight: 44,
                    padding: "0 22px",
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    color: "#0f172a",
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  {t.inicio}
                </a>
              </div>
            </>
          )}
        </main>
      </body>
    </html>
  );
}
