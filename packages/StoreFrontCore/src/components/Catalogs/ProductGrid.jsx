import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCatalogProducts } from "../../services/catalogApi";

/**
 * Inheritance-safe product grid:
 * - Uses GET /api/catalogs/:id/products (materialized ProductDefinition)
 * - Shows Loading / Empty states
 * - Card click -> Product Edit
 * - "Inherited" badge click -> Base Product edit (if route exists)
 */
export default function ProductGrid({
  catalogId,
  pageSize = 24,
  productEditRoute = "/products",
  // baseEditRoute = "/productBases",
}) {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    setError("");
  }, [catalogId]);

  useEffect(() => {
    if (!catalogId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchCatalogProducts(catalogId, { page, pageSize });
        if (cancelled) return;

        const arr = Array.isArray(data) ? data : data?.items ?? [];
        setHasMore(arr.length === pageSize);
        setItems((prev) => (page === 1 ? arr : [...prev, ...arr]));
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Error loading products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [catalogId, page, pageSize]);

  const canLoadMore = useMemo(
    () => !loading && hasMore && items.length > 0,
    [loading, hasMore, items.length]
  );

  function openProduct(productId) {
    // Pass current catalogId so ProductEditPage can use it for cloning defaults
    navigate(`${productEditRoute}/${encodeURIComponent(productId)}`, {
      state: { catalogId },
    });
  }



  if (!catalogId) {
    return (
      <div className="p-4 text-sm opacity-70">
        Select a catalog to view products.
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">Error: {error}</div>;
  }

  if (loading && items.length === 0) {
    return <div className="p-4 text-sm">Loading products...</div>;
  }

  if (!loading && items.length === 0) {
    return <div className="p-4 text-sm">No products found.</div>;
  }

  return (
    <div className="p-3">
<div className="mb-3 flex items-center justify-between">
  <h2 className="text-sm font-semibold opacity-70">Products</h2>

</div>


      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => {
          const def = p?.ProductDefinition || {};
          const name = def?.Name || "Untitled Product";
          const short = def?.ShortDescription || "";

          return (
            <button
              key={p._id}
              type="button"
              onClick={() => openProduct(p._id)}
              className="text-left rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              title={p._id}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{name}</div>

                  {short ? (
                    <div className="mt-1 line-clamp-2 text-xs opacity-70">
                     <Display htmlString={short} />
                    </div>
                  ) : null}
                </div>

              </div>

              <div className="mt-3 text-xs opacity-60">
                ID: <span className="font-mono">{p._id}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center">
        {loading ? (
          <div className="text-sm">Loading more…</div>
        ) : canLoadMore ? (
          <button
            className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50"
            onClick={() => setPage((x) => x + 1)}
          >
            Load more
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Display({ htmlString }) {
  const decoded = htmlString
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/")
    .replace(/\\r\\n/g, "")     // removes escaped \r\n
    .replace(/\r\n/g, "")       // removes actual line breaks
    .trim();   
    

  return (
    <div
      dangerouslySetInnerHTML={{ __html: decoded }}
    />
  );
}
