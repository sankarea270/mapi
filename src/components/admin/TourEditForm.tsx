"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";

interface Props {
  tour: {
    id: string;
    name_es: string;
    name_en: string;
    name_pt: string;
    duration_es: string | null;
    duration_en: string | null;
    duration_pt: string | null;
    price: number;
    rating: number;
    featured: boolean;
    status: string;
    image_url: string | null;
    excerpt_es: string | null;
    excerpt_en: string | null;
    excerpt_pt: string | null;
    category_id: string | null;
  };
  categories: Array<{ id: string; slug: string; name_es: string }>;
}

export function TourEditForm({ tour, categories }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      name_es: form.get("name_es"),
      name_en: form.get("name_en"),
      name_pt: form.get("name_pt"),
      duration_es: form.get("duration_es"),
      duration_en: form.get("duration_en"),
      duration_pt: form.get("duration_pt"),
      price: Number(form.get("price")),
      rating: Number(form.get("rating")),
      featured: form.get("featured") === "on",
      status: form.get("status"),
      image_url: form.get("image_url"),
      excerpt_es: form.get("excerpt_es"),
      excerpt_en: form.get("excerpt_en"),
      excerpt_pt: form.get("excerpt_pt"),
      category_id: form.get("category_id"),
    };

    const res = await fetch(`/api/admin/tours/${tour.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/tours");
    } else {
      alert("Error al guardar");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este tour permanentemente?")) return;
    const res = await fetch(`/api/admin/tours/${tour.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/tours");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Names */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Nombres (i18n)</h2>
        {(["es", "en", "pt"] as const).map((lang) => (
          <div key={lang}>
            <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">{lang}</label>
            <input
              name={`name_${lang}`}
              defaultValue={tour[`name_${lang}`]}
              required
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Datos</h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Categoría</label>
          <select
            name="category_id"
            defaultValue={tour.category_id ?? ""}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_es}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Precio (USD)</label>
            <input
              name="price"
              type="number"
              defaultValue={tour.price}
              required
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Rating</label>
            <input
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              defaultValue={tour.rating}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Duración</h2>
        {(["es", "en", "pt"] as const).map((lang) => (
          <div key={lang}>
            <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">{lang}</label>
            <input
              name={`duration_${lang}`}
              defaultValue={tour[`duration_${lang}`] ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        ))}
      </div>

      {/* Excerpt */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Excerpt</h2>
        {(["es", "en", "pt"] as const).map((lang) => (
          <div key={lang}>
            <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">{lang}</label>
            <textarea
              name={`excerpt_${lang}`}
              defaultValue={tour[`excerpt_${lang}`] ?? ""}
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        ))}
      </div>

      {/* Image + Status */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Imagen y estado</h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">URL de imagen</label>
          <input
            name="image_url"
            defaultValue={tour.image_url ?? ""}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={tour.featured}
              className="size-4 rounded border-slate-300"
            />
            Destacado
          </label>
          <select
            name="status"
            defaultValue={tour.status}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="size-4" />
          Eliminar
        </button>
      </div>
    </form>
  );
}
