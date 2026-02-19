// src/blocks/blocks/HtmlCssSection.jsx
import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

function scopeCss(css, scopeClass) {
  if (!css || !scopeClass) return '';

  // Very small CSS "scoper": prefixes selectors with the scope class.
  // - Leaves @media/@supports blocks intact (recursively scopes inside)
  // - Ignores keyframes
  const scope = `.${scopeClass}`;

  const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
  let input = stripComments(css);

  // Handle @keyframes blocks by temporarily replacing them
  const keyframes = [];
  input = input.replace(/@keyframes[\s\S]*?\{[\s\S]*?\}\s*\}/g, (m) => {
    keyframes.push(m);
    return `__KEYFRAMES_${keyframes.length - 1}__`;
  });

  const scopeSimpleRules = (chunk) => {
    return chunk.replace(/([^{}]+)\{/g, (match, selectorPart) => {
      const sel = selectorPart.trim();
      if (!sel) return match;
      if (sel.startsWith('@')) return match; // @media handled elsewhere

      // Split selectors and prefix each
      const scopedSelectors = sel
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          // Prevent global root selectors
          const lowered = s.toLowerCase();
          if (lowered === 'html' || lowered === 'body' || lowered === ':root') {
            return scope;
          }
          // If selector already contains the scope, keep it.
          if (s.includes(scope)) return s;
          return `${scope} ${s}`;
        })
        .join(', ');

      return `${scopedSelectors}{`;
    });
  };

  const scopeAtMedia = (s) => {
    // Scope inside @media / @supports blocks
    return s.replace(/@(media|supports)[^{]+\{([\s\S]*?)\}\s*/g, (m, atType, inner) => {
      const scopedInner = scopeAll(inner);
      // Preserve exact header
      const header = m.slice(0, m.indexOf('{') + 1);
      return `${header}${scopedInner}}`;
    });
  };

  const scopeAll = (s) => {
    let out = scopeAtMedia(s);
    out = scopeSimpleRules(out);
    return out;
  };

  let out = scopeAll(input);

  // Restore keyframes
  out = out.replace(/__KEYFRAMES_(\d+)__/g, (_, i) => keyframes[Number(i)] || '');

  return out;
}

export default function HtmlCssSection({ html = '', css = '', blockId }) {
  const scopeClass = useMemo(() => `ns-htmlcss-${String(blockId).replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [blockId]
  );

  const safeHtml = useMemo(() => {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script'],
      FORBID_ATTR: [
        'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
        'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup',
      ],
    });
  }, [html]);

  const scopedCss = useMemo(() => scopeCss(css, scopeClass), [css, scopeClass]);

  if (!safeHtml && !scopedCss) return null;

  return (
    <div className={scopeClass}>
      {scopedCss ? <style>{scopedCss}</style> : null}
      {safeHtml ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      ) : null}
    </div>
  );
}
