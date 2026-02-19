// src/blocks/blocks/ProductTitle.jsx
import React from 'react';

export default function ProductTitle({ tag = 'h1', context }) {
  const Tag = tag;
  const name = context?.name || context?.productName || context?.product?._id || 'Product';
  return <Tag className="text-2xl font-semibold leading-tight">{name}</Tag>;
}
