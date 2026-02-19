// src/components/Catalogs/layouts/LayoutSidebarWithGrid.jsx
import React from 'react';
import CatalogList from '../CatalogList';
import ProductGrid from '../ProductGrid';
import CatalogBreadcrumbs from '../CatalogBreadcrumbs';
import CatalogPathSearch from '../CatalogPathSearch';

function LayoutSidebarWithGrid({
  catalogs,
  loading,
  error,

  onCatalogClick,
  onNavigateUp,
  parentCatalog,


  searchQuery,
  onSearchChange,
  // statusFilter,
  // onStatusFilterChange,

  breadcrumbs,
  onBreadcrumbClick,

  // onAddCatalog,
  // onEditCatalog,
  onReorderCatalogs,
  setLastItem,

  onPathSearch,
  onPathSelect,
}) {
  return (
    <div className="flex flex-col h-full">
      <header className="p-3 border-b bg-gray-50 flex items-center justify-between gap-2">
        <CatalogBreadcrumbs breadcrumbs={breadcrumbs} onBreadcrumbClick={onBreadcrumbClick} />
        <div className="flex items-center gap-2">
          {parentCatalog && (
            <>
              {/* <button
                type="button"
                onClick={() => onEditCatalog?.(parentCatalog)}
                className="text-[11px] px-2 py-1 rounded border text-gray-600 hover:bg-gray-100"
              >
                Edit this catalog
              </button> */}
              <button
                type="button"
                onClick={onNavigateUp}
                className="text-[11px] px-2 py-1 rounded border text-gray-600 hover:bg-gray-100"
              >
                Up one level
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 flex flex-col border-r bg-gray-50">
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-semibold">Catalogs</h1>
            </div>

            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search catalogs…"
                className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>

            {onPathSearch && onPathSelect && <CatalogPathSearch onSearch={onPathSearch} onSelect={onPathSelect} />}
          </div>

          <div className="flex-1 overflow-auto p-3">
            <CatalogList
              catalogs={catalogs}
              loading={loading}
              onCatalogClick={onCatalogClick}
              // onEditCatalog={onEditCatalog}
              onReorder={onReorderCatalogs}
              setLastItem={setLastItem}
            />
          </div>
        </aside>

        <main className="flex-1 p-4 overflow-auto">
          {error && <div className="text-sm text-red-600 mb-3">{String(error)}</div>}
        <ProductGrid catalogId={parentCatalog?._id} />

        </main>
      </div>
    </div>
  );
}

export default LayoutSidebarWithGrid;
