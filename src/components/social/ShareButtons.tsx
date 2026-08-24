"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

const shareTargets = ["x", "facebook", "whatsapp"] as const;

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const hrefs: Record<(typeof shareTargets)[number], string> = {
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
        <Share2 className="size-4" />
        {t("title")}
      </span>
      <div className="flex gap-2">
        {shareTargets.map((target) => (
          <a
            key={target}
            href={hrefs[target]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(target)}
            className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-amber-400 hover:text-slate-900"
          >
            {target === "whatsapp" ? (
              <MessageCircle className="size-4" />
            ) : (
              <span className="text-xs font-bold">{target === "x" ? "𝕏" : "f"}</span>
            )}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label={t("copy")}
          className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-amber-400 hover:text-slate-900"
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </button>
      </div>
      {copied && (
        <span className="text-xs font-semibold text-emerald-600">{t("copied")}</span>
      )}
    </div>
  );
}