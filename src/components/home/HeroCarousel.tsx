"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1920&auto=format&fit=crop",
    alt: "Machu Picchu, maravilla del mundo",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFBgf/xAAoEAACAQMDAwMFAQAAAAAAAAABAgMABBEFEiETMUEGUXEUIjJhgZH/xAAWAQEBAQAAAAAAAAAAAAAAAAABAAL/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREx/9oADAMBAAIRAxEAPwDnvTLwg5BGcU5aadNPqEcdw3hjDMueATjFW9PtlW2EcKfUDaQW7HB7U1p8Ct1brH3E5z75pxXR9W0P6lTI08LgZ7c/FY4SX2jajPb64zt0nKRzR8SRnsMjngj5rZ3mDk9uO1LeL0xJql3eCa12W0jSRqHyXA7cmiwmMf/Z",
  },
  {
    src: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1920&auto=format&fit=crop",
    alt: "Valle Sagrado de los Incas",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQCAwUG/8QAJhAAAgEDBAEEAwEAAAAAAAAAAQIDAAQRBRIhMRNBUWFxFCKBkf/EABYBAQEBAAAAAAAAAAAAAAAAAAECA//EABkRAQEBAQEBAAAAAAAAAAAAAAEAAhExIf/aAAwDAQACEQMRAD8A5kLjvr5pxI8DJqhJgOc9088/FevcMGK4AGM8VXGzuDdwsvbmPYJf0Z5z2ahc31xMi+Vuf1OMD/KhDI5nJDEZPOTg05cXKnHi+sCBjuKa1l6YmjIyD3T1q0iKGlfcxPfgCs1bt0kBY+wOKt/InETJu2fkDzigJa//2Q==",
  },
  {
    src: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1920&auto=format&fit=crop",
    alt: "Vinicunca, montaña de 7 colores",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAUBBAYH/8QAJxAAAgEDAwQBBQEAAAAAAAAAAQIDBAURAAYhBxITMRQiI0FRYXH/xAAWAQEBAQAAAAAAAAAAAAAAAAABAAL/xAAYEQEBAQEBAAAAAAAAAAAAAAABAAIRMf/aAAwDAQACEQMRAD8A54EJOCMEaIFY8jBxjB1crB0wvV3pDUU1JGE9wil3YkqCQSOB5OjF70avVdYkuRkQRj3eopI+WVcjkn5OtIuBYVq+xRw+NpBI75JCDBGPzqt6i3X3N2SzMWpp5TKBw2wY/rVbtLePdu+tpWt1UZkWZZhBUlBESMhTgjGeOeBqUtS2yWzr1Ga3VEUtJVRmOREVlJKkZXODxj41n73f7k29TUIpqaUzOBJFI5d0AAPq4PJAJJ+daOvzN8gLc57jeq2nlrY4Ioo2hklqJ2OMJkrH6icnH9Z1ZuPVG5VVPJSLGIXkbLzhnL4C58Y9QB9Hzq1arPcr/cJLZTMFo9sofiWeblVHJA9Y/Os/vWnhprqKKl2rR28U6lBWo5d5Wf5ZioAXnoAHTGowLZXblr5pKSsqGf3k+QqWZV9uCyjPK+0Dpk/I0aNG5v/Z",
  },
  {
    src: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1920&auto=format&fit=crop",
    alt: "Laguna Humantay, joya de los Andes",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQBAgUG/8QAKBAAAgEDAwMEAgMAAAAAAAAAAQIDAAQRBRIhMUEGE1FhIoEjMnGh0f/EABYBAQEBAAAAAAAAAAAAAAAAAAIBA//EABkRAQEBAQEBAAAAAAAAAAAAAAEAAhExIf/aAAwDAQACEQMRAD8A5oxD4qSgU5GCKf0+xkvrmOCBT7jDt4GP7rVXnTg05Ub9oW6dvrj1o3WVQG+MdcH/ABpSaLqNrq1kl1bk4PBU8lT4IroYPWdxb3EaTJHOYjlXU/kv3/leXOs2N/dLDcxuJWXcs4BXcPzOJ72kjbmvjVWKJbXqk26L/FdWNuQ0oEauRu3qB/JHjpXqGjQ3+naNBBftum35LRjAJwPNFdBn//Z",
  },
  {
    src: "https://images.unsplash.com/photo-1621887178805-37e802d9ed4c?q=80&w=1920&auto=format&fit=crop",
    alt: "Sacsayhuamán, fortaleza inca en Cusco",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQCAwUG/8QAKBAAAgECBAYCAwEAAAAAAAAAAQIDBBEABRIhMRMUIkFRYXGBBpGh/8QAFgEBAQEAAAAAAAAAAAAAAAAAAgAD/8QAHBEAAgICAwAAAAAAAAAAAAAAAAECEQMSITFh/9oADAMBAAIRAxEAPwDlY80p2i1wRTSnqLamqr/PbmVXPmWfKaOsqqp2Vpp29Cg8LYg+r73wrjJVJImg3sTxD1Yx/mOi4OZKD1gC22+13iDxxdHYycXU7bM80pJ5GeWeqhBF/UrggFrE7X7YrfM81qFiqpJp2Qs+h2UbqLAAX3/mMuGXSVVfVQh+GdTqCRcH8sMaKVPqpRi9JVZ3ndfmtbJWVTH1WVQqiwUCwGGCrhHF1Kx0r+OLbW/OGM0RHE//2Q==",
  },
];

const INTERVAL = 7000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const next = useCallback(() => {
    setActive((i) => (i + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next, reduced]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === active ? "z-10 opacity-100" : "z-0 opacity-0"
          )}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            quality={i === 0 ? 90 : 75}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={slide.blur}
            className={cn(
              "object-cover",
              i === active && !reduced && "animate-[ken-burns_25s_ease-in-out_infinite_alternate]"
            )}
          />
        </div>
      ))}

      {/* Arrows */}
      <button
        type="button"
        onClick={() => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Imagen anterior"
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 grid size-11 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-105 sm:left-6 sm:size-12"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente imagen"
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 grid size-11 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-105 sm:right-6 sm:size-12"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ir a imagen ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === active
                ? "w-8 bg-amber-400"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
