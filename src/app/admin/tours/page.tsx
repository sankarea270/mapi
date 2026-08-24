import Link from "next/link";
import Image from "next/image";
import { Plus, Star, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

async function getTours() {
  if (!supabase) return [];

  const { data } = await supabase
    .from("tours")
    .select("id, slug, name_es, name_en, price, rating, featured, status, image_url, categories(name_es)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function ToursListPage() {
  const tours = await getTours();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Tours</h1>
          <p className="mt-1 text-sm text-slate-500">{tours.length} tours registrados</p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 hover:shadow-md"
        >
          <Plus className="size-4" />
          Nuevo tour
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">Tour</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tours.map((tour) => (
                <tr key={String(tour.id)} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {tour.image_url && (
                          <Image
                            src={String(tour.image_url)}
                            alt={String(tour.name_es)}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{String(tour.name_es)}</p>
                        <p className="text-xs text-slate-400">{String(tour.slug)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {String((tour.categories as unknown as { name_es: string })?.name_es ?? "—")}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">${String(tour.price)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Star className="size-3 fill-current" />
                      {String(tour.rating)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        tour.status === "published"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tour.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/tours/${String(tour.id)}`}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/tours/${String(tour.slug)}`}
                        target="_blank"
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {tours.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                    No hay tours.{" "}
                    <Link href="/admin/tours/new" className="text-amber-500 hover:underline">
                      Crear el primero
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
