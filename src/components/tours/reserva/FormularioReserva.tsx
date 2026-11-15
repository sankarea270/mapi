"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Star,
} from "lucide-react";
import { enlaceWhatsapp } from "@/config/ajustes";
import { useAjustes } from "@/components/providers/Ajustes";
import { WhatsAppIcon } from "@/components/layout/SocialIcons";
import { Price } from "@/components/ui/Price";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CalendarioReserva, deTexto } from "./CalendarioReserva";
import { MAX_VIAJEROS, type Reserva } from "./useReserva";

export interface Valoracion {
  media: number;
  total: number;
}

/*
 * Cabecera del panel: el precio por persona manda. La valoración solo sale
 * si el tour tiene reseñas propias; antes se enseñaba el campo `rating` de la
 * ficha («5.0 / 5») aunque nadie hubiera opinado.
 */
export function CabeceraPrecio({
  precio,
  locale,
  duracion,
  valoracion,
  compacta = false,
}: {
  precio: number;
  locale: string;
  duracion: string;
  valoracion?: Valoracion;
  compacta?: boolean;
}) {
  const t = useTranslations("reservaTour");
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-slate-900 text-white",
        compacta ? "px-5 pb-4 pt-4" : "px-6 pb-5 pt-6 [@media(max-height:780px)]:pb-4 [@media(max-height:780px)]:pt-4"
      )}
    >
      {/* Un brillo petróleo en la esquina: da profundidad sin recurrir al
          orbe borroso de plantilla. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgb(10_123_121/0.45),transparent_62%)]"
      />
      <div className="relative [&_p]:text-left">
        <p className="font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-teal-200/80">
          {t("from")}
        </p>
        <div className="mt-1.5">
          <Price amount={precio} locale={locale} size={compacta ? "lg" : "xl"} onDark suffix={t("perPerson")} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3.5 text-[13px] text-teal-50/80 [@media(max-height:780px)]:mt-3 [@media(max-height:780px)]:pt-2.5">
          {valoracion && (
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-3.5 fill-oro text-oro" aria-hidden />
              <span className="font-semibold text-white">{valoracion.media.toFixed(1)}</span>
              <span>· {t("reviews", { count: valoracion.total })}</span>
            </span>
          )}
          {duracion && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-teal-200/80" aria-hidden />
              {duracion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* Pie pegado al borde inferior del área que se desplaza (tarjeta o hoja). */
const pie =
  "sticky bottom-0 z-10 -mx-6 -mb-6 border-t border-slate-100 bg-white/95 px-6 pb-6 pt-3 backdrop-blur-sm";

const campo =
  "w-full rounded-lg border-0 bg-slate-50 px-3.5 py-3 text-base text-slate-900 sm:text-[15px] ring-1 ring-slate-200 outline-none transition-[box-shadow,background-color] placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500";

/**
 * Formulario de reserva en dos pasos —el viaje y tus datos— más la
 * confirmación. En dos pasos porque el panel va fijo al hacer scroll y tenía
 * que caber en la pantalla: con los seis campos a la vez medía 920 px y el
 * botón de enviar quedaba fuera de la vista en un portátil.
 */
export function FormularioReserva({
  r,
  nombreTour,
  locale,
}: {
  r: Reserva;
  nombreTour: string;
  locale: string;
}) {
  const t = useTranslations("reservaTour");
  const te = useTranslations("reserva.errors");
  const ajustes = useAjustes();
  const id = useId();
  const [calendarioAbierto, setCalendarioAbierto] = useState(!r.fecha);
  const [conMensaje, setConMensaje] = useState(Boolean(r.datos.mensaje));

  const fechaLarga = r.fecha
    ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(
        deTexto(r.fecha)
      )
    : "";
  const fechaCorta = r.fecha
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(deTexto(r.fecha))
    : "";
  const totalTexto = formatPrice(r.total, locale, "USD");
  const viajerosTexto = t("travelersCount", { count: r.viajeros });

  const mensajeWhatsapp = [
    `${t("waTour")}: ${nombreTour}`,
    `${t("date")}: ${fechaLarga}`,
    `${t("travelers")}: ${r.viajeros}`,
    r.datos.nombre && `${t("fullName")}: ${r.datos.nombre}`,
    r.datos.email && `${t("email")}: ${r.datos.email}`,
    r.datos.telefono && `${t("whatsapp")}: ${r.datos.telefono}`,
    r.datos.mensaje && `${t("message")}: ${r.datos.mensaje}`,
  ]
    .filter(Boolean)
    .join("\n");
  const hrefWhatsapp = enlaceWhatsapp(ajustes, mensajeWhatsapp);

  if (r.paso === "enviado") {
    return (
      <div className="px-6 pb-7 pt-7 text-center [&_p]:text-center reserva-entra">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-50 ring-8 ring-teal-50/60 reserva-pop">
          <Check className="size-7 text-teal-600" strokeWidth={2.5} aria-hidden />
        </span>
        <h3 className="mt-5 font-heading text-xl font-bold text-slate-900">{t("successTitle")}</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
          {t("successBody", { email: r.datos.email })}
        </p>
        <dl className="mt-6 divide-y divide-slate-100 rounded-xl bg-slate-50 px-4 text-left text-sm ring-1 ring-slate-100">
          {(
            [
              [t("waTour"), nombreTour],
              [t("date"), fechaLarga],
              [t("travelers"), viajerosTexto],
              [t("estimate"), totalTexto],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-right font-medium text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
        <a
          href={hrefWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-teal-800 ring-1 ring-teal-200 transition-colors hover:bg-teal-50"
        >
          <WhatsAppIcon className="size-4" />
          {t("successWhatsapp")}
        </a>
        <button
          type="button"
          onClick={() => {
            r.reiniciar();
            setCalendarioAbierto(true);
          }}
          className="mt-3 text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          {t("another")}
        </button>
      </div>
    );
  }

  if (r.paso === "fallo") {
    return (
      <div className="px-6 pb-7 pt-7 text-center [&_p]:text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50">
          <AlertTriangle className="size-6 text-amber-600" aria-hidden />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">{t("errorTitle")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("errorBody")}</p>
        <a
          href={hrefWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
        >
          <WhatsAppIcon className="size-4" />
          {t("errorWhatsapp")}
        </a>
        <button
          type="button"
          onClick={() => r.setPaso("datos")}
          className="mt-3 text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  const pasos = [
    { id: "viaje", texto: t("stepTrip") },
    { id: "datos", texto: t("stepDetails") },
  ] as const;

  return (
    /* `[&_p]:text-left`: la web justifica los párrafos con una regla general
       (#contenido p) y en un panel tan estrecho abría huecos entre palabras. */
    <div className="px-6 pb-6 pt-5 [&_p]:text-left">
      {/* Los dos pasos, con una barra que avanza. */}
      <ol className="grid grid-cols-2 gap-3" aria-label={t("steps")}>
        {pasos.map((p, i) => {
          const hecho = p.id === "viaje" && r.paso === "datos";
          const activo = r.paso === p.id;
          return (
            <li key={p.id} aria-current={activo ? "step" : undefined}>
              <span className="block h-[3px] overflow-hidden rounded-full bg-slate-100">
                <span
                  className={cn(
                    "block h-full rounded-full bg-amber-500 transition-[width] duration-500 motion-reduce:transition-none",
                    activo || hecho ? "w-full" : "w-0"
                  )}
                />
              </span>
              <span
                className={cn(
                  "mt-2 flex items-center gap-1.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em]",
                  activo ? "text-slate-900" : "text-slate-400"
                )}
              >
                {hecho ? <Check className="size-3.5 text-amber-600" aria-hidden /> : <span>{i + 1}.</span>}
                {p.texto}
              </span>
            </li>
          );
        })}
      </ol>

      {r.paso === "viaje" ? (
        <div
          key="viaje"
          className="mt-6 space-y-5 reserva-entra"
        >
          {/* Fecha: plegada en una línea cuando ya está elegida. */}
          <div>
            <span id={`${id}-fecha`} className="text-[13px] font-semibold text-slate-700">
              {t("date")}
            </span>
            {calendarioAbierto ? (
              <div
                role="group"
                aria-labelledby={`${id}-fecha`}
                className={cn(
                  "mt-2 rounded-xl p-3 ring-1 transition-colors",
                  r.intentoViaje && r.errores.fecha ? "ring-red-300" : "ring-slate-200"
                )}
              >
                <CalendarioReserva
                  valor={r.fecha}
                  minimo={r.minimo}
                  locale={locale}
                  onCambio={(f) => {
                    r.setFecha(f);
                    setCalendarioAbierto(false);
                  }}
                  etiquetas={{ anterior: t("prevMonth"), siguiente: t("nextMonth") }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCalendarioAbierto(true)}
                aria-describedby={`${id}-fecha`}
                className="group mt-2 flex w-full items-center gap-3 rounded-lg bg-slate-50 px-3.5 py-3 text-left ring-1 ring-slate-200 transition-colors hover:bg-white hover:ring-teal-400"
              >
                <CalendarDays className="size-[18px] shrink-0 text-teal-600" aria-hidden />
                <span className="flex-1 text-[15px] font-medium text-slate-900 first-letter:uppercase">
                  {fechaLarga}
                </span>
                <span className="text-xs font-semibold text-teal-700 group-hover:underline">{t("change")}</span>
              </button>
            )}
            {r.intentoViaje && r.errores.fecha && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">
                {te(r.errores.fecha)}
              </p>
            )}
          </div>

          {/* Viajeros: un contador en vez de seis botones 1-6+. */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <span id={`${id}-viajeros`} className="text-[13px] font-semibold text-slate-700">
                {t("travelers")}
              </span>
              <p className="text-xs text-slate-500">{t("travelersHint")}</p>
            </div>
            <div role="group" aria-labelledby={`${id}-viajeros`} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => r.setViajeros(r.viajeros - 1)}
                disabled={r.viajeros <= 1}
                aria-label={t("fewer")}
                className="grid size-9 place-items-center rounded-full text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-900 hover:text-white hover:ring-slate-900 disabled:pointer-events-none disabled:opacity-30"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <output aria-live="polite" className="w-10 text-center font-heading text-xl font-bold tabular-nums text-slate-900">
                {r.viajeros}
              </output>
              <button
                type="button"
                onClick={() => r.setViajeros(r.viajeros + 1)}
                disabled={r.viajeros >= MAX_VIAJEROS}
                aria-label={t("more")}
                className="grid size-9 place-items-center rounded-full text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-900 hover:text-white hover:ring-slate-900 disabled:pointer-events-none disabled:opacity-30"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Total y botón pegados al pie de la tarjeta: con el calendario
              abierto el cuerpo se desplaza, y el botón tiene que seguir a la
              vista. */}
          <div className={pie}>
          {/* El total cambia en vivo con los viajeros. */}
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-50/30 px-4 py-3 ring-1 ring-amber-100">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold text-slate-700">{t("estimate")}</span>
              <span key={r.total} className="font-heading text-2xl font-bold tabular-nums text-slate-900 reserva-entra">
                {totalTexto}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatPrice(r.precio, locale, "USD")} × {viajerosTexto} · {t("estimateNote")}
            </p>
          </div>

          <button
            type="button"
            onClick={r.continuar}
            className="group mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 text-[15px] font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-[background-color,transform] hover:bg-amber-400 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            {t("continue")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </button>
          </div>
        </div>
      ) : (
        <form
          key="datos"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void r.enviar();
          }}
          className="mt-6 space-y-4 reserva-entra"
        >
          {/* Lo elegido en el paso 1, a la vista y editable. */}
          <button
            type="button"
            onClick={() => r.setPaso("viaje")}
            className="group flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-left ring-1 ring-slate-200 transition-colors hover:ring-teal-400"
          >
            <ArrowLeft className="size-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700">
              <span className="font-semibold text-slate-900 first-letter:uppercase">{fechaCorta}</span> · {viajerosTexto} ·{" "}
              <span className="font-semibold text-slate-900">{totalTexto}</span>
            </span>
            <span className="text-xs font-semibold text-teal-700 group-hover:underline">{t("change")}</span>
          </button>

          <Campo id={`${id}-nombre`} etiqueta={t("fullName")} error={r.intentoDatos && r.errores.nombre ? te(r.errores.nombre) : ""}>
            <input
              id={`${id}-nombre`}
              type="text"
              autoComplete="name"
              value={r.datos.nombre}
              onChange={(e) => r.poner("nombre", e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              className={campo}
            />
          </Campo>

          <Campo id={`${id}-email`} etiqueta={t("email")} error={r.intentoDatos && r.errores.email ? te(r.errores.email) : ""}>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={r.datos.email}
              onChange={(e) => r.poner("email", e.target.value)}
              placeholder={t("emailPlaceholder")}
              className={campo}
            />
          </Campo>

          <Campo
            id={`${id}-tel`}
            etiqueta={t("whatsapp")}
            opcional={t("optional")}
            ayuda={t("whatsappHint")}
            error={r.intentoDatos && r.errores.telefono ? te(r.errores.telefono) : ""}
          >
            <input
              id={`${id}-tel`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={r.datos.telefono}
              onChange={(e) => r.poner("telefono", e.target.value)}
              placeholder="+51 9XX XXX XXX"
              className={campo}
            />
          </Campo>

          {conMensaje ? (
            <Campo id={`${id}-msg`} etiqueta={t("message")} opcional={t("optional")} error={r.intentoDatos && r.errores.mensaje ? te(r.errores.mensaje) : ""}>
              <textarea
                id={`${id}-msg`}
                rows={3}
                autoFocus
                value={r.datos.mensaje}
                onChange={(e) => r.poner("mensaje", e.target.value)}
                placeholder={t("messagePlaceholder")}
                className={cn(campo, "resize-none")}
              />
            </Campo>
          ) : (
            <button
              type="button"
              onClick={() => setConMensaje(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              <Plus className="size-4" aria-hidden />
              {t("addMessage")}
            </button>
          )}

          {/* Trampa para robots: fuera de la vista y del tabulador. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={r.datos.web}
            onChange={(e) => r.poner("web", e.target.value)}
            className="absolute -left-[9999px] size-px opacity-0"
          />

          <div className={pie}>
          <button
            type="submit"
            disabled={r.enviando}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 text-[15px] font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-[background-color,transform] hover:bg-amber-400 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            {r.enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {r.enviando ? t("sending") : t("submit")}
          </button>
          <p className="mt-2.5 flex items-start justify-center gap-1.5 text-center text-xs leading-relaxed text-slate-500">
            <ShieldCheck className="mt-px size-3.5 shrink-0 text-teal-600" aria-hidden />
            {t("assurance")}
          </p>
          </div>
        </form>
      )}
    </div>
  );
}

function Campo({
  id,
  etiqueta,
  opcional,
  ayuda,
  error,
  children,
}: {
  id: string;
  etiqueta: string;
  opcional?: string;
  ayuda?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(error && "[&_input]:ring-red-300 [&_textarea]:ring-red-300")}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-[13px] font-semibold text-slate-700">
        {etiqueta}
        {opcional && <span className="text-xs font-normal text-slate-400">({opcional})</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        ayuda && <p className="mt-1.5 text-xs text-slate-500">{ayuda}</p>
      )}
    </div>
  );
}
