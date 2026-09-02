/*
 * Comprueba el estado de Supabase y, sobre todo, que las políticas RLS
 * bloquean de verdad. Que una política exista no demuestra que funcione.
 *
 * Se usan dos clientes:
 *   · anon    — el que va dentro del JavaScript público de la web
 *   · service — el de administración, se salta RLS
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function contar(cliente: typeof anon, tabla: string): Promise<number | string> {
  const { count, error } = await cliente.from(tabla).select("*", { count: "exact", head: true });
  return error ? `error: ${error.message}` : (count ?? 0);
}

const ok = (b: boolean) => (b ? "OK  " : "FALLA");

async function main() {
  console.log("\n=== CONTENIDO (visto por el administrador) ===");
  for (const t of ["categories", "tours", "destinations", "packages", "reviews", "reservations", "admins"]) {
    console.log(`  ${t.padEnd(14)} ${await contar(admin, t)}`);
  }

  console.log("\n=== LO QUE VE LA WEB (clave anónima) ===");
  for (const t of ["categories", "tours", "destinations", "packages", "reviews"]) {
    console.log(`  ${t.padEnd(14)} ${await contar(anon, t)}`);
  }

  console.log("\n=== PRUEBAS DE SEGURIDAD ===");

  // Un visitante NO puede crear tours.
  const escritura = await anon.from("tours").insert({
    slug: "prueba-intrusion-" + Date.now(),
    name_es: "prueba",
    name_en: "prueba",
    name_pt: "prueba",
    price: 1,
  });
  console.log(`  ${ok(escritura.error !== null)}  escribir tours sin sesión queda bloqueado`);

  // Un visitante NO puede borrar.
  const borrado = await anon.from("tours").delete().neq("slug", "");
  const borradas = borrado.error ? 0 : (borrado.count ?? 0);
  console.log(`  ${ok(borrado.error !== null || borradas === 0)}  borrar tours sin sesión queda bloqueado`);

  // Un visitante NO puede leer las reservas: son datos personales.
  const leerReservas = await anon.from("reservations").select("email").limit(1);
  const filtrado = leerReservas.error !== null || (leerReservas.data ?? []).length === 0;
  console.log(`  ${ok(filtrado)}  leer reservas ajenas queda bloqueado`);

  // Un visitante SÍ debe poder dejar una solicitud: si no, el formulario
  // de la web dejaría de funcionar.
  const alta = await anon.from("reservations").insert({
    tour_slug: "prueba-verificacion",
    full_name: "Prueba de verificación",
    email: "prueba@ejemplo.com",
    travel_date: "2030-01-01",
    travelers: 1,
    notes: "Fila de prueba; se borra al terminar.",
  });
  console.log(`  ${ok(alta.error === null)}  el formulario de reservas SÍ puede escribir`);
  await admin.from("reservations").delete().eq("tour_slug", "prueba-verificacion");

  console.log("\n=== ADMINISTRADORES DADOS DE ALTA ===");
  const { data: admins } = await admin.from("admins").select("email");
  if (!admins?.length) console.log("  (ninguno todavía — falta el paso 4)");
  else admins.forEach((a) => console.log(`  ${a.email}`));

  console.log("\n=== CUENTAS EN AUTHENTICATION ===");
  const { data: usuarios, error } = await admin.auth.admin.listUsers();
  if (error) console.log(`  error: ${error.message}`);
  else if (!usuarios.users.length) console.log("  (ninguna todavía — falta el paso 3)");
  else
    usuarios.users.forEach((u) =>
      console.log(`  ${u.email}  ${u.email_confirmed_at ? "confirmada" : "SIN CONFIRMAR"}`)
    );
  console.log("");
}

main();
