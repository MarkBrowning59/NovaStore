// src/blocks/ImageBlock.jsx
import React from 'react';

export default function ImageBlock({ src = '', alt = '', fit = 'cover', aspect = 'auto', rounded = true }) {
  if (!src) return null;

  const aspectClass = aspect === '4/3' ? 'aspect-[4/3]' : aspect === '1/1' ? 'aspect-square' : '';

  return (
    <div className={[
      'w-full overflow-hidden bg-slate-50',
      rounded ? 'rounded-2xl' : '',
      aspectClass,
    ].filter(Boolean).join(' ')}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full"
        style={{ objectFit: fit }}
        loading="lazy"
      />
    </div>
  );
}
