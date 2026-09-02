import { AdminApp } from "@/components/admin/AdminApp";

/*
 * El panel es una cáscara vacía en el HTML: todo se pinta en el navegador,
 * después de comprobar la sesión. Así el fichero que Apache sirve no lleva
 * dentro ni un dato del negocio, aunque alguien acierte con la dirección.
 */
export default function AdminPage() {
  return <AdminApp />;
}
