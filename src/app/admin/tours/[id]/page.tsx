import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TourEditForm } from "@/components/admin/TourEditForm";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!supabase) return notFound();

  const { data: tour } = await supabase.from("tours").select("*").eq("id", id).single();
  if (!tour) return notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_es")
    .order("sort_order");

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
          <h1 className="font-heading text-2xl font-bold text-slate-900">Editar tour</h1>
          <p className="mt-0.5 text-sm text-slate-500">{tour.name_es}</p>
        </div>
      </div>
      <TourEditForm tour={tour} categories={categories ?? []} />
    </div>
  );
}
