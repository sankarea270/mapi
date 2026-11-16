"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { registrarReserva } from "@/lib/reservas";
import { aTexto } from "./CalendarioReserva";

export type PasoReserva = "viaje" | "datos" | "enviado" | "fallo";

interface Datos {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  /** Trampa para robots: el campo está oculto y una persona nunca lo rellena. */
  web: string;
}

const VACIO: Datos = { nombre: "", email: "", telefono: "", mensaje: "", web: "" };
export const MAX_VIAJEROS = 30;

/**
 * Estado del panel de reserva de un tour.
 *
 * Un solo estado para la tarjeta de escritorio y la hoja del móvil: si
 * alguien empieza en una y gira la tableta, sigue donde estaba. El borrador
 * se guarda en `sessionStorage` por tour, para no perder lo escrito al abrir
 * otra pestaña o recargar; nunca después de enviar.
 *
 * La solicitud se envía desde la página y se confirma solo cuando la base de
 * datos la ha recibido. Antes el botón abría WhatsApp y la guardaba de fondo
 * «si podía»: quien no terminaba la conversación no dejaba rastro, y el panel
 * tenía una sola reserva en toda su historia.
 */
export function useReserva({
  slug,
  nombreTour,
  precio,
  locale,
}: {
  slug: string;
  nombreTour: string;
  precio: number;
  locale: string;
}) {
  const clave = `gotomapi-reserva-${slug}`;
  const [paso, setPaso] = useState<PasoReserva>("viaje");
  const [fecha, setFecha] = useState("");
  const [viajeros, setViajeros] = useState(2);
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [intentoViaje, setIntentoViaje] = useState(false);
  const [intentoDatos, setIntentoDatos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  /* Mañana como primer día: una reserva para hoy mismo no se puede confirmar. */
  const minimo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return aTexto(d);
  }, []);

  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(clave);
      if (!guardado) return;
      const b = JSON.parse(guardado);
      if (typeof b.fecha === "string" && b.fecha >= minimo) setFecha(b.fecha);
      if (Number.isInteger(b.viajeros)) setViajeros(Math.min(MAX_VIAJEROS, Math.max(1, b.viajeros)));
      if (b.datos) setDatos({ ...VACIO, ...b.datos, web: "" });
    } catch {
      /* Sin almacenamiento (modo privado): se empieza de cero. */
    }
  }, [clave, minimo]);

  useEffect(() => {
    if (paso === "enviado") return;
    try {
      sessionStorage.setItem(clave, JSON.stringify({ fecha, viajeros, datos: { ...datos, web: "" } }));
    } catch {
      /* Igual que arriba. */
    }
  }, [clave, paso, fecha, viajeros, datos]);

  const errores = {
    fecha: fecha ? "" : "date",
    nombre: datos.nombre.trim().length >= 2 ? "" : "fullName",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim()) ? "" : "email",
    telefono:
      !datos.telefono.trim() || datos.telefono.replace(/\D/g, "").length >= 7 ? "" : "whatsapp",
    mensaje: datos.mensaje.length <= 500 ? "" : "messageMax",
  };

  const total = precio * viajeros;

  const poner = useCallback(
    <K extends keyof Datos>(campo: K, valor: Datos[K]) => setDatos((d) => ({ ...d, [campo]: valor })),
    []
  );

  const continuar = () => {
    setIntentoViaje(true);
    if (!errores.fecha) setPaso("datos");
  };

  const enviar = async () => {
    setIntentoDatos(true);
    if (errores.nombre || errores.email || errores.telefono || errores.mensaje) return;
    /* Un robot que rellena todo se lleva un «enviado» y no se guarda nada. */
    if (datos.web) {
      setPaso("enviado");
      return;
    }
    setEnviando(true);
    const ok = await registrarReserva({
      tourSlug: slug,
      tourName: nombreTour,
      fullName: datos.nombre.trim(),
      email: datos.email.trim(),
      phone: datos.telefono.trim(),
      date: fecha,
      travelers: viajeros,
      message: datos.mensaje.trim(),
      locale,
    });
    setEnviando(false);
    setPaso(ok ? "enviado" : "fallo");
    if (ok) {
      try {
        sessionStorage.removeItem(clave);
      } catch {
        /* nada */
      }
    }
  };

  const reiniciar = () => {
    setPaso("viaje");
    setFecha("");
    setViajeros(2);
    setDatos(VACIO);
    setIntentoViaje(false);
    setIntentoDatos(false);
  };

  return {
    paso,
    setPaso,
    fecha,
    setFecha,
    viajeros,
    setViajeros: (n: number) => setViajeros(Math.min(MAX_VIAJEROS, Math.max(1, n))),
    datos,
    poner,
    errores,
    intentoViaje,
    intentoDatos,
    enviando,
    minimo,
    precio,
    total,
    continuar,
    enviar,
    reiniciar,
  };
}

export type Reserva = ReturnType<typeof useReserva>;
