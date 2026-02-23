// src/blocks/AddToCart.jsx
import React from 'react';

export default function AddToCart({ label = 'Add to cart', context }) {
  const onAdd = context?.onAddToCart;

  return (
    <button
      type="button"
      className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
      onClick={() => {
        if (typeof onAdd === 'function') onAdd(context?.product);
        else alert('Hook this up to your cart flow');
      }}
    >
      {label}
    </button>
  );
}
