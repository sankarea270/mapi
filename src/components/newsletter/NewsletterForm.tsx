"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

export function NewsletterForm() {
  const [state, setState] = useState({ ok: false, error: null as string | null });
  const [pending, setPending] = useState(false);
  const t = useTranslations("newsletter");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    
    // Simulación - en versión estática no funciona el formulario
    setTimeout(() => {
      setPending(false);
      setState({ ok: false, error: "Este formulario no está disponible en la versión estática." });
    }, 1000);
  };

  return (
    <div>
      {state.ok ? (
        <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
¡Gracias por suscribirte!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="Tu email..."
            className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="size-4" />
            {pending ? "..." : "Suscribirse"}
          </button>
        </form>
      )}
      {!state.ok && state.error && (
        <p className="mt-2 text-xs font-semibold text-red-400">
          {state.error}
        </p>
      )}
    </div>
  );
}