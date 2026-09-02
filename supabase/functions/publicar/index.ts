// Función de Supabase: lanza la recompilación del sitio.
//
// Se ejecuta en Deno, en los servidores de Supabase. NO se compila con el
// resto del proyecto y no forma parte del sitio estático.
//
// Existe por una razón concreta: avisar a GitHub Actions exige un token con
// permiso de escritura sobre el repositorio. Si ese token estuviera en el
// JavaScript del panel, estaría publicado —el navegador descarga el fichero
// entero— y cualquiera podría lanzar despliegues, o algo peor. Aquí el token
// vive en el servidor y el panel solo pide "publica", identificándose.
//
// Despliegue:  supabase functions deploy publicar
// Secretos:    supabase secrets set GITHUB_TOKEN=... GITHUB_REPO=usuario/repo

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// El panel se sirve desde otro dominio, así que el navegador manda antes una
// petición OPTIONS para preguntar si tiene permiso.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function responder(cuerpo: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const autorizacion = req.headers.get("Authorization");
  if (!autorizacion) return responder({ error: "Falta la sesión." }, 401);

  // Se crea un cliente que actúa EN NOMBRE de quien llama, propagando su
  // cabecera. Así las políticas RLS se aplican a esa persona y no a la
  // función: es la propia base de datos la que decide si es administrador.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: autorizacion } } },
  );

  const { data: usuario } = await supabase.auth.getUser();
  if (!usuario?.user) return responder({ error: "Sesión no válida." }, 401);

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", usuario.user.id)
    .maybeSingle();

  if (!admin) return responder({ error: "Esta cuenta no es administradora." }, 403);

  const token = Deno.env.get("GITHUB_TOKEN");
  const repo = Deno.env.get("GITHUB_REPO");
  if (!token || !repo) {
    return responder(
      { error: "Faltan los secretos GITHUB_TOKEN o GITHUB_REPO en la función." },
      500,
    );
  }

  // `repository_dispatch` es un aviso: GitHub arranca el workflow que ya
  // existe (compilar y subir por FTPS) sin necesidad de hacer un commit.
  const respuesta = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "publicar-contenido",
      client_payload: { por: usuario.user.email },
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    console.error("[publicar] GitHub respondió", respuesta.status, detalle);
    return responder(
      { error: `GitHub rechazó la petición (${respuesta.status}).` },
      502,
    );
  }

  return responder({ ok: true });
});
