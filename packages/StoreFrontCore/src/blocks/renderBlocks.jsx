// src/blocks/renderBlocks.jsx
import React from 'react';
import { blockRegistry } from './blockRegistry';

function mergeDefaults(type, props) {
  const def = blockRegistry[type]?.defaults || {};
  return { ...def, ...(props || {}) };
}

/**
 * Renders a list of blocks.
 * @param {Array} blocks - [{ id, type, props }]
 * @param {object} context - trusted data/functions (product, resolved, onAddToCart, etc.)
 */
export function renderBlocks(blocks, context) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return blocks.map((b, idx) => {
    const type = b?.type;
    const entry = type ? blockRegistry[type] : null;
    const Comp = entry?.component;
    if (!Comp) {
      return (
        <div key={b?.id || idx} className="rounded-xl border border-dashed p-3 text-xs opacity-70">
          Unknown block: <span className="font-mono">{String(type)}</span>
        </div>
      );
    }

    const props = mergeDefaults(type, b?.props);
    return <Comp key={b?.id || idx} {...props} context={context} blockId={b?.id || `idx_${idx}`} />;
  });
}
