"use server";

import { reservationSchema, type ReservationPayload } from "@/lib/reservation";
import { rateLimited } from "@/lib/rateLimit";
import { siteConfig } from "@/config/site";

export interface CreateReservationResult {
  ok: boolean;
  code?: string;
  errors?: Partial<Record<string, string>>;
  limited?: boolean;
}

async function sendEmailNotification(input: ReservationPayload, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[reservation] RESEND_API_KEY no configurada; notificación no enviada.", code);
    return;
  }

  const text = [
    `Nueva reserva ${code}`,
    `Tour: ${input.tourName}`,
    `Fecha: ${input.date}`,
    `Viajeros: ${input.travelers}`,
    `Nombre: ${input.fullName}`,
    `Email: ${input.email}`,
    `WhatsApp: ${input.whatsapp}`,
    input.message ? `Mensaje: ${input.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Reservas <reservas@${process.env.RESEND_DOMAIN ?? "mapi.travel"}>`,
        to: [siteConfig.email],
        subject: `Nueva reserva ${code} · ${input.tourName}`,
        text,
      }),
    });
    if (!response.ok) {
      console.error("[reservation] Error enviando email:", response.status, await response.text());
    }
  } catch (error) {
    console.error("[reservation] Excepción enviando email:", error);
  }
}

export async function createReservation(input: ReservationPayload): Promise<CreateReservationResult> {
  if (input.website && input.website.length > 0) {
    return { ok: false };
  }

  if (await rateLimited("reserve", 5, 60_000)) {
    return { ok: false, limited: true };
  }

  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string") {
        errors[path] = issue.message;
      }
    }
    return { ok: false, errors };
  }

  const code = `MAP-${Date.now().toString(36).toUpperCase()}`;
  await sendEmailNotification(parsed.data, code);

  return { ok: true, code };
}