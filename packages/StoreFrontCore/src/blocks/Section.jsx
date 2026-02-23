// src/blocks/Section.jsx
import React from 'react';
import { renderBlocks } from '../renderBlocks.jsx';

const padMap = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const bgMap = {
  transparent: '',
  white: 'bg-white',
  slate: 'bg-slate-50',
};

export default function Section({ title, padding = 'md', background = 'transparent', rounded = true, bordered = false, blocks = [], context }) {
  return (
    <section className={[
      'w-full',
      rounded ? 'rounded-2xl' : '',
      bordered ? 'border shadow-sm' : '',
      bgMap[background] || '',
      padMap[padding] || padMap.md,
    ].filter(Boolean).join(' ')}>
      {title ? <div className="mb-3 text-sm font-semibold">{title}</div> : null}
      {blocks?.length ? <div className="space-y-4">{renderBlocks(blocks, context)}</div> : null}
    </section>
  );
}
