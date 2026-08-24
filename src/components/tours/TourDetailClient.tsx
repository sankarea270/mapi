"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { Lightbox } from "@/components/ui/Lightbox";

interface TourDetailClientProps {
  gallery: string[];
  name: string;
}

export function TourDetailClient({ gallery, name }: TourDetailClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {gallery.map((image, index) => (
          <figure
            key={image}
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-slate-100"
            onClick={() => setLightboxIndex(index)}
          >
            <Image
              src={image}
              alt={`${name} ${index + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="grid size-12 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <ZoomIn className="size-5" />
              </div>
            </div>
          </figure>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          alt={name}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
