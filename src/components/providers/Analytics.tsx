"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId && !window.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);
      window.gtag = function gtag(...args: unknown[]) {
        (window as unknown as { dataLayer: unknown[] }).dataLayer.push(args);
      };
      (window as unknown as { dataLayer: unknown[] }).dataLayer = (
        window as unknown as { dataLayer: unknown[] }
      ).dataLayer ?? [];
      window.gtag("js", new Date());
      window.gtag("config", gaId, { send_page_view: true });
    }

    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (pixelId && !window.fbq) {
      (window as unknown as { _fbq?: unknown })._fbq =
        (window as unknown as { _fbq?: unknown })._fbq ?? [];
      window.fbq = function fbq(...args: unknown[]) {
        (window as unknown as { _fbq: unknown[] })._fbq.push(args);
      };
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
      window.fbq("init", pixelId);
      window.fbq("track", "PageView");
    }
  }, []);

  return null;
}