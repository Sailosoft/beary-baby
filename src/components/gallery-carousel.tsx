"use client";

import { useState } from "react";
import type { ProductGallery } from "@/domain/product";

export function GalleryCarousel({
  mainImage,
  galleries,
  alt,
}: {
  mainImage: string;
  galleries: ProductGallery[];
  alt: string;
}) {
  const images = [mainImage, ...galleries.map((g) => g.imageUrl)];
  const [index, setIndex] = useState(0);

  if (images.length === 1) {
    return (
      <div className="aspect-square overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 shadow-lg shadow-pink-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mainImage} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 relative shadow-lg shadow-pink-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${alt} — image ${index + 1}`}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          aria-label="Previous image"
          className="btn btn-circle btn-sm absolute left-3 top-1/2 -translate-y-1/2 border-none bg-white/80 text-pink-700 shadow-md backdrop-blur hover:bg-white"
          onClick={() => setIndex((index - 1 + images.length) % images.length)}
        >
          ❮
        </button>
        <button
          type="button"
          aria-label="Next image"
          className="btn btn-circle btn-sm absolute right-3 top-1/2 -translate-y-1/2 border-none bg-white/80 text-pink-700 shadow-md backdrop-blur hover:bg-white"
          onClick={() => setIndex((index + 1) % images.length)}
        >
          ❯
        </button>
        <span
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-beary-pink-deep shadow-sm backdrop-blur"
          aria-hidden
        >
          {index + 1} / {images.length}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`w-16 h-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              i === index
                ? "border-pink-500 ring-2 ring-pink-200 opacity-100"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            aria-label={`Show image ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
