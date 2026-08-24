"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewTourPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      slug: form.get("slug"),
      name_es: form.get("name_es"),
      name_en: form.get("name_en"),
      name_pt: form.get("name_pt"),
      duration_es: form.get("duration_es"),
      duration_en: form.get("duration_en"),
      duration_pt: form.get("duration_pt"),
      price: Number(form.get("price")),
      rating: Number(form.get("rating") ?? "4.8"),
      featured: form.get("featured") === "on",
      status: form.get("status") ?? "draft",
      image_url: form.get("image_url"),
      excerpt_es: form.get("excerpt_es"),
      excerpt_en: form.get("excerpt_en"),
      excerpt_pt: form.get("excerpt_pt"),
    };

    const res = await fetch("/api/admin/tours", {
      method: "POST",
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/tours"
          className="grid size-9 place-items-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 transition hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Nuevo tour</h1>
          <p className="mt-0.5 text-sm text-slate-500">Completa los datos del tour</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Names */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Nombres (i18n)</h2>
          {["es", "en", "pt"].map((lang) => (
            <div key={lang}>
              <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                {lang}
              </label>
              <input
                name={`name_${lang}`}
                required
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          ))}
        </div>

        {/* Slug */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Identificadores</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Slug</label>
            <input
              name="slug"
              required
              pattern="[a-z0-9\-]+"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              placeholder="mi-tour"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Precio (USD)</label>
              <input
                name="price"
                type="number"
                required
                min="0"
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
                defaultValue="4.8"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Duración</h2>
          {["es", "en", "pt"].map((lang) => (
            <div key={lang}>
              <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                {lang}
              </label>
              <input
                name={`duration_${lang}`}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="1 día"
              />
            </div>
          ))}
        </div>

        {/* Excerpt */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Excerpt</h2>
          {["es", "en", "pt"].map((lang) => (
            <div key={lang}>
              <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">
                {lang}
              </label>
              <textarea
                name={`excerpt_${lang}`}
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
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              placeholder="https://picsum.photos/seed/mi-tour/900/700"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="featured" className="size-4 rounded border-slate-300" />
              Destacado
            </label>
            <select
              name="status"
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Guardando..." : "Crear tour"}
        </button>
      </form>
    </div>
  );
}
