"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightboxProps {
  images: string[];
  alt: string;
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ images, alt, initialIndex = 0, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, next, prev]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} - ${current + 1} de ${images.length}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Cerrar"
      >
        <X className="size-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4 sm:size-12"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4 sm:size-12"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <div
        className="relative h-[70vh] w-[90vw] max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[current]}
          alt={`${alt} ${current + 1}`}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
              )}
              aria-label={`Imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
