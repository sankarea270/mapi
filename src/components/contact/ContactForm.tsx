"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SentPanel } from "@/components/ui/SentPanel";
import { useWhatsappSend } from "@/hooks/useWhatsappSend";

export function ContactForm() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const { url, send, reset, isSent } = useWhatsappSend();

  const resumen = (): Array<[string, string]> =>
    (
      [
        [t("name"), name],
        [t("email"), email],
        phone ? [t("whatsapp"), phone] : null,
        message ? [t("message"), message] : null,
      ] as Array<[string, string] | null>
    ).filter((x): x is [string, string] => x !== null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(
      resumen()
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    );
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20";

  if (isSent && url) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <SentPanel url={url} summary={resumen()} onReset={reset} />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-slate-900">{t("formTitle")}</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("name")} *
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("email")} *
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@correo.com"
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {t("whatsapp")}
        </span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+51 9xx xxx xxx"
          className={inputClass}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {t("message")} *
        </span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Quiero visitar Machu Picchu en octubre..."
          className={cn(inputClass, "h-auto py-3")}
        />
      </label>

      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/20 transition-colors hover:bg-amber-300"
      >
        <Send className="size-4" />
        {t("submit")}
      </button>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <MessageCircle className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
        Al enviar se abrirá WhatsApp con tu mensaje listo para enviar a nuestro equipo.
      </p>
    </form>
  );
}