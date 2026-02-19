// src/blocks/blocks/ProductGallery.jsx
import React, { useMemo } from 'react';

export default function ProductGallery({ maxThumbs = 8, context }) {
  const images = useMemo(() => {
    const arr = context?.images || [];
    return Array.isArray(arr) ? arr : [];
  }, [context]);

  const primary = images[0] || null;
  const primarySrc = typeof primary === 'string' ? primary : primary?.url;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center">
        {primarySrc ? (
          <img src={primarySrc} alt={context?.name || ''} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <div className="text-xs opacity-60">No image</div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.slice(0, maxThumbs).map((img, idx) => {
            const src = typeof img === 'string' ? img : img?.url;
            return (
              <div key={idx} className="aspect-square overflow-hidden rounded-xl border bg-white">
                {src ? (
                  <img src={src} alt={`thumb-${idx}`} className="h-full w-full object-cover" loading="lazy" />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
