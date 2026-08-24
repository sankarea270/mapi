"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { subscribeNewsletter, type NewsletterState } from "@/app/actions/newsletter";

const initialState: NewsletterState = { ok: false };

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  return (
    <div>
      {state.ok ? (
        <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
          {t("success")}
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="locale" value={locale} />
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="newsletter-website">Website</label>
            <input id="newsletter-website" type="text" tabIndex={-1} autoComplete="off" name="website" />
          </div>
          <label htmlFor="newsletter-email" className="sr-only">
            {t("placeholder")}
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("placeholder")}
            className="h-11 w-full rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="size-4" />
            {pending ? "…" : t("submit")}
          </button>
        </form>
      )}
      {!state.ok && state.error && (
        <p className="mt-2 text-xs font-semibold text-red-400">
          {state.error === "invalid" ? t("invalid") : t("error")}
        </p>
      )}
    </div>
  );
}