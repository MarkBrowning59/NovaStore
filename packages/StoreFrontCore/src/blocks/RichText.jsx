// src/blocks/RichText.jsx
import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

export default function RichText({ html = '' }) {
  const safeHtml = useMemo(() => {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onmouseenter', 'onmouseleave'],
    });
  }, [html]);

  if (!safeHtml) return null;

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
