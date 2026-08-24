"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const user = form.get("user") as string;
    const pass = form.get("pass") as string;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-amber-400 text-slate-950">
            <Compass className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Mapi Travels</h1>
          <p className="mt-1 text-sm text-white/50">Panel de administración</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-xl"
        >
          <div>
            <label htmlFor="user" className="mb-1 block text-xs font-medium text-slate-500">
              Usuario
            </label>
            <input
              id="user"
              name="user"
              type="text"
              required
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div>
            <label htmlFor="pass" className="mb-1 block text-xs font-medium text-slate-500">
              Contraseña
            </label>
            <input
              id="pass"
              name="pass"
              type="password"
              required
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
