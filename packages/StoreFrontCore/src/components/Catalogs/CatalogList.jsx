/* eslint-disable no-empty */
import { useMemo, useRef, useState } from 'react';
import { useCatalog } from '../../hooks/useCatalog';



function arrayMove(list, fromIndex, toIndex) {
  const arr = list.slice();
  const [item] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, item);
  return arr;
}

export default function CatalogList({
  catalogs = [],
  loading = false,
  onNavigate,
  onCatalogClick,
  onReorder, 
  setLastItem,
}) {
  const { prefetchCatalogProducts } = useCatalog();

  const rows = useMemo(() => (Array.isArray(catalogs) ? catalogs : []), [catalogs]);

  const dragFromIdRef = useRef(null);
  const [dragOverId, setDragOverId] = useState(null);

  const go = (catalog) => {
    if (!catalog?._id) return;

    if (typeof onCatalogClick === 'function') {
      onCatalogClick(catalog);
      return;
    }
    if (typeof onNavigate === 'function') {
      onNavigate(catalog._id, catalog.name);
    }
  };

  const handleDragStart = (id) => (e) => {
    dragFromIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(id));
    } catch {}
  };

  const handleDragOver = (id) => (e) => {
    e.preventDefault(); // allow drop
    if (dragOverId !== id) setDragOverId(id);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (toId) => (e) => {
    e.preventDefault();
    const fromId =
      dragFromIdRef.current ||
      (() => {
        try {
          return e.dataTransfer.getData('text/plain');
        } catch {
          return null;
        }
      })();

    dragFromIdRef.current = null;
    setDragOverId(null);

    if (!fromId || !toId || String(fromId) === String(toId)) return;

    const fromIndex = rows.findIndex((r) => String(r?._id) === String(fromId));
    const toIndex = rows.findIndex((r) => String(r?._id) === String(toId));
    if (fromIndex < 0 || toIndex < 0) return;

    const next = arrayMove(rows, fromIndex, toIndex);
    onReorder?.(next);
  };

  const handleDragEnd = () => {
    dragFromIdRef.current = null;
    setDragOverId(null);
  };

  if (rows.length === 0) {
    return <div className="text-xs text-gray-500">{loading ? 'Loading…' : 'No catalogs found.'}</div>;
  }

  return (
    <div className="space-y-1">
      <div className="text-[11px] text-gray-500 pb-1">Tip: drag a row by the handle to reorder.</div>

      {rows.map((catalog, index) => {
        const isLast = index === rows.length - 1;
        const isDragOver = dragOverId && String(dragOverId) === String(catalog?._id);

        return (
          <div
            key={catalog?._id ?? index}
            ref={isLast ? setLastItem : null}
            className={`flex items-center justify-between gap-2 rounded px-1.5 py-1 border border-transparent hover:bg-white/60 ${
              isDragOver ? 'bg-indigo-50 border-indigo-200' : ''
            }`}
            onDragOver={handleDragOver(catalog?._id)}
            onDrop={handleDrop(catalog?._id)}
          >
            <div
              className="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 select-none"
              draggable
              onDragStart={handleDragStart(catalog?._id)}
              onDragEnd={handleDragEnd}
              title="Drag to reorder"
              aria-label="Drag to reorder"
            >
              ⋮⋮
            </div>

            <button
              type="button"
              className="text-left flex-1 text-sm text-blue-700 hover:underline"
              onClick={() => go(catalog)}
              onMouseEnter={() => {
                if (!catalog?.products || catalog.products.length === 0) return;
                prefetchCatalogProducts?.(catalog._id, catalog.products);
              }}
              title={catalog?.name || ''}
            >
              {catalog?.name || '(Unnamed catalog)'}
            </button>

            <div className="flex items-center gap-2">
              {/* <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${status.cls}`} title={`Status: ${status.label}`}>
                {status.label}
              </span> */}

            </div>
          </div>
        );
      })}

      {loading && <div className="text-xs text-gray-500 pt-2">Loading more…</div>}
    </div>
  );
}
