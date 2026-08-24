"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, MessageCircle, User, Mail, Phone, Send, MapPin } from "lucide-react";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker";

const TRAVELER_OPTIONS = ["1", "2", "3", "4", "5", "6+"];

interface BookingFormProps {
  tourSlug?: string;
  tourName?: string;
}

export function BookingForm({ tourSlug = "", tourName = "" }: BookingFormProps) {
  const t = useTranslations("reserva");
  const [form, setForm] = useState({
    tourName: tourName,
    date: new Date().toISOString().split('T')[0],
    travelers: "2",
    fullName: "",
    email: "",
    whatsapp: "",
    message: ""
  });
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    
    // Redirigir a WhatsApp con la información
    const message = `Hola! Me interesa el tour "${form.tourName}" para ${form.travelers} personas el ${form.date}. 
    
Mis datos:
- Nombre: ${form.fullName}
- Email: ${form.email}
- WhatsApp: ${form.whatsapp}
- Mensaje: ${form.message}`;
    
    setTimeout(() => {
      window.open(whatsappLink(message), '_blank');
      setPending(false);
    }, 500);
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-xl bg-amber-50 text-amber-600">
          <Send className="size-6" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-slate-900">{t("title")}</h3>
          <p className="text-sm text-slate-600">{t("subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {tourSlug && (
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              {t("tour")}
            </label>
            <div className="mt-1.5">
              <input
                type="text"
                value={form.tourName}
                onChange={(e) => setForm({...form, tourName: e.target.value})}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                placeholder={t("tourPlaceholder")}
              />
            </div>
          </div>
        )}

        <DatePicker
          value={form.date}
          onChange={(dateStr) => setForm({...form, date: dateStr})}
          label={t("date")}
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            {t("travelers")}
          </label>
          <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TRAVELER_OPTIONS.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setForm({...form, travelers: num})}
                className={cn(
                  "flex-1 rounded-xl py-3 text-sm font-medium transition-all",
                  form.travelers === num || (num === "6+" && Number(form.travelers) >= 6)
                    ? "bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            {t("fullName")}
          </label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <User className="size-4" />
            </div>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({...form, fullName: e.target.value})}
              className="block w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
              placeholder={t("fullNamePlaceholder")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              {t("email")}
            </label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail className="size-4" />
              </div>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="block w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                placeholder={t("emailPlaceholder")}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              {t("whatsapp")}
            </label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Phone className="size-4" />
              </div>
              <input
                type="tel"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({...form, whatsapp: e.target.value})}
                className="block w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                placeholder={t("whatsappPlaceholder")}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            {t("message")}
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
            rows={3}
            className="mt-1.5 block w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
            placeholder={t("messagePlaceholder")}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/20 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MessageCircle className="size-4" />
          {pending ? t("submitting") : t("whatsappConfirm")}
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        {t("noPayment")}
      </p>
    </div>
  );
}