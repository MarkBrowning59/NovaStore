import React, { useState, useEffect } from 'react';

/**
 * Props:
 *  - onSearch(term) => Promise<results[]>
 *  - onSelect(result) => void
 */
export default function CatalogPathSearch({
  onSearch,
  onSelect,
}) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Handle typing with debounce
  const handleChange = (e) => {
    const value = e.target.value;
    setTerm(value);

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value || value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      if (!onSearch) return;
      setLoading(true);
      try {
        const res = await onSearch(value.trim());
        setResults(Array.isArray(res) ? res : []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    setDebounceTimer(t);
  };

  const handleSelect = (item) => {
    if (onSelect) onSelect(item);
    setOpen(false);
    setResults([]);
    setTerm('');
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={term}
        onChange={handleChange}
        placeholder="Path search (type 2+ chars)…"
        className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
      />
      {loading && (
        <div className="absolute right-2 top-1.5 text-[10px] text-gray-400">
          …
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow text-xs max-h-64 overflow-auto">
          {results.map((item) => {
            const pathLabel = (item.path || [])
              .map((p) => p.name)
              .join(' / ');

            return (
              <button
                key={item.id}
                type="button"
                className="w-full text-left px-2 py-1 hover:bg-indigo-50"
                onClick={() => handleSelect(item)}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-[10px] text-gray-500">
                  {pathLabel}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
