// src/utils/HtmlContent.jsx
import React from 'react';

// Clean up the escaped HTML coming from XMPie / Mongo
function decodeXmpieHtml(html) {
  if (!html) return '';

  return html
    // turn literal \r\n into real breaks
    .replace(/\\r\\n/g, '<br />')
    .replace(/\\n/g, '<br />')
    .replace(/\\t/g, ' ')
    // unescape \" to "
    .replace(/\\"/g, '"')
    // fix <\/p>, <\/td>, etc.
    .replace(/\\\//g, '/');
}

export default function HtmlContent({ html, className = '' }) {
  if (!html) return null;

  const decoded = decodeXmpieHtml(html);

  return (
    <div
      className={className}
      // We trust this content because it comes from your own catalog DB
      dangerouslySetInnerHTML={{ __html: decoded }}
    />
  );
}
