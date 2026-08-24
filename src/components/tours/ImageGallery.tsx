"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          key={active}
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${alt} ${index + 1}`}
              className={cn(
                "relative aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:w-28",
                index === active
                  ? "border-amber-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={image} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}