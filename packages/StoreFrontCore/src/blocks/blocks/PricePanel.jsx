// src/blocks/blocks/PricePanel.jsx
import React from 'react';

export default function PricePanel({ context }) {
  const priceText = context?.priceText || '';
  if (!priceText) return null;
  return <div className="text-xl font-semibold">{priceText}</div>;
}
