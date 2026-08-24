"use server";

import { z } from "zod";
import { rateLimited } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["es", "en", "pt"]),
  website: z.string().optional(),
});

export type NewsletterState = { ok: boolean; error?: string };

export async function subscribeNewsletter(
  prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    locale: formData.get("locale"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const { email, locale, website } = parsed.data;

  if (website && website.length > 0) {
    return { ok: false, error: "invalid" };
  }

  if (await rateLimited("newsletter", 5, 60_000)) {
    return { ok: false, error: "server" };
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "Mapi Travels <onboarding@resend.dev>",
          to: email,
          subject:
            locale === "es"
              ? "¡Bienvenido a Mapi Travels!"
              : locale === "en"
                ? "Welcome to Mapi Travels!"
                : "Bem-vindo à Mapi Travels!",
          html:
            locale === "es"
              ? "<p>¡Gracias por suscribirte! Pronto recibirás ofertas exclusivas y consejos de viaje por Perú.</p>"
              : locale === "en"
                ? "<p>Thanks for subscribing! You will soon receive exclusive offers and travel tips for Peru.</p>"
                : "<p>Obrigado por se inscrever! Em breve você receberá ofertas exclusivas e dicas de viagem para o Peru.</p>",
        }),
      });

      if (!response.ok) {
        console.error("[newsletter] resend failed:", response.status);
        return { ok: false, error: "server" };
      }
    } catch (error) {
      console.error("[newsletter] send failed:", error);
      return { ok: false, error: "server" };
    }
  } else {
    console.log(`[newsletter] ${locale}: ${email}`);
  }

  return { ok: true };
}