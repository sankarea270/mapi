"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { SOCIAL_POSTS } from "@/data/socialFeed";
import { siteConfig, socials } from "@/config/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function SocialFeed() {
  const t = useTranslations("social");
  const instagram = socials.instagram;
  const reduced = useReducedMotion();
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`flex flex-col items-center justify-between gap-6 sm:flex-row scroll-animate ${isVisible ? "animate-fade-in-up" : ""}`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              {t("badge")}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-400">
              {t("subtitle")}
            </p>
          </div>
          <a
            href={instagram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            {t("follow")}
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {SOCIAL_POSTS.map((post, i) => (
            <a
              key={post.id}
              href={instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative block aspect-square overflow-hidden rounded-xl scroll-animate ${
                isVisible && !reduced ? `animate-fade-in-scale delay-${Math.min(i + 1, 6) * 100}` : ""
              }`}
            >
              <Image
                src={post.image}
                alt={post.caption.es}
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 300px, 50vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="line-clamp-2 text-xs font-semibold text-white">
                  {post.caption.es}
                </p>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-white">
                  <Heart className="size-3.5 fill-current" />
                  {post.likes.toLocaleString("es")}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
