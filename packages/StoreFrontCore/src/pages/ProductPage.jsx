// src/pages/ProductPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../services/productApi";
import { getProductBase } from "../services/productBasesApi";
import { deepMerge, getByPath } from "../utils/inheritance";

// Decode HTML entities like &lt;p&gt; into real tags before rendering
function decodeHtmlEntities(str) {
  if (typeof str !== "string") return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

/**
 * Optional: very light “cleanup” hook if your HTML blobs contain junk.
 * Customize rules here (remove empty nodes, extra breaks, etc).
 */
function cleanHtml(html) {
  if (!html) return "";
  // Example cleanup: remove empty paragraphs & extra whitespace-only nodes
  return html
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<div>\s*<\/div>/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function ProductPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const [baseDoc, setBaseDoc] = useState(null);

  // Load product
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getProduct(id);
        if (cancelled) return;

        setProduct(data);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load base product (if needed)
  useEffect(() => {
    let cancelled = false;

    async function loadBase() {
      try {
        const embedded = product?.BaseProduct;
        if (embedded) {
          setBaseDoc(embedded);
          return;
        }

        const baseId = product?.BaseProductID ?? null;
        if (!baseId) {
          setBaseDoc(null);
          return;
        }

        const res = await getProductBase(baseId);
        if (cancelled) return;

        setBaseDoc(res?.baseProduct || res);
      } catch (e) {
        // Non-fatal for storefront rendering
        console.warn("Failed to load base product:", e);
        setBaseDoc(null);
      }
    }

    if (product) loadBase();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const baseDefaults = useMemo(() => baseDoc?.Defaults || null, [baseDoc]);

  // Compute “resolved” view (base + overrides + extensions) like admin does
  const resolved = useMemo(() => {
    const overrides = product?.Overrides || {};
    const extensions = product?.Extensions || {};
    const base = baseDefaults || {};

    let merged = deepMerge(base, overrides, extensions);

    // Back-compat: preserve legacy fields stored directly on product docs.
    const legacyDef = product?.ProductDefinition;
    if (legacyDef && typeof legacyDef === "object") {
      merged.ProductDefinition = deepMerge(merged.ProductDefinition || {}, legacyDef);
    }

    if (product?.capabilities && typeof product.capabilities === "object") {
      merged.capabilities = deepMerge(merged.capabilities || {}, product.capabilities);
    }
    if (product?.config && typeof product.config === "object") {
      merged.config = deepMerge(merged.config || {}, product.config);
    }
    if (product?.productType) merged.productType = merged.productType ?? product.productType;
    if (product?.interactionType) merged.interactionType = merged.interactionType ?? product.interactionType;

    return merged;
  }, [product, baseDefaults]);

  const name = useMemo(() => {
    return (
      getByPath(resolved, "ProductDefinition.Name", "") ||
      product?._id ||
      "Product"
    );
  }, [resolved, product]);

  const shortDescription = useMemo(() => {
    return getByPath(resolved, "ProductDefinition.ShortDescription", "");
  }, [resolved]);

  // Try a few likely description fields (customize to your schema)
  const rawHtmlDescription = useMemo(() => {
    return (
      getByPath(resolved, "ProductDefinition.DescriptionHtml", "") ||
      getByPath(resolved, "ProductDefinition.DescriptionHTML", "") ||
      getByPath(resolved, "ProductDefinition.LongDescriptionHtml", "") ||
      getByPath(resolved, "ProductDefinition.LongDescription", "") ||
      ""
    );
  }, [resolved]);

  const htmlDescription = useMemo(() => {
    const decoded = decodeHtmlEntities(rawHtmlDescription);
    return cleanHtml(decoded);
  }, [rawHtmlDescription]);

  // Images: customize to match your actual model
  const images = useMemo(() => {
    const arr =
      getByPath(resolved, "ProductDefinition.Images", null) ||
      getByPath(resolved, "images", null) ||
      [];
    return Array.isArray(arr) ? arr : [];
  }, [resolved]);

  const primaryImage = images?.[0] || null;

  // Price: customize to match your actual model
  const priceText = useMemo(() => {
    const from =
      getByPath(resolved, "Pricing.FromPrice", null) ??
      getByPath(resolved, "pricing.fromPrice", null) ??
      getByPath(resolved, "ProductDefinition.FromPrice", null) ??
      null;

    const base =
      getByPath(resolved, "Pricing.BasePrice", null) ??
      getByPath(resolved, "pricing.basePrice", null) ??
      getByPath(resolved, "price", null) ??
      null;

    const val = from ?? base;
    if (val == null || val === "") return "";

    // If number-like, format; else show as-is (some systems store “From $48.40 USD” as a string)
    const n = Number(val);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
    }
    return String(val);
  }, [resolved]);

  if (loading) return <div className="p-4 text-sm">Loading product…</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;
  if (!product) return <div className="p-4 text-sm">Product not found.</div>;

  console.log(product);
  
  return (
    <div className="mx-auto max-w-6xl p-4">
      {/* Header / nav */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            className="rounded-xl border px-3 py-2 shadow-sm hover:bg-slate-50"
            onClick={() => nav(-1)}
          >
            Back
          </button>

          {/* Optional: link back to catalog/list routes */}
          <Link className="rounded-xl border px-3 py-2 shadow-sm hover:bg-slate-50" to="/catalogs">
            Catalogs
          </Link>
        </div>

        <div className="text-xs opacity-70">
          Product ID: <span className="font-mono">{product._id}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gallery */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center">
            {primaryImage ? (
              // If your images are objects, adjust: primaryImage.url etc.
              <img
                src={typeof primaryImage === "string" ? primaryImage : primaryImage?.url}
                alt={name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="text-xs opacity-60">No image</div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 10).map((img, idx) => {
                const src = typeof img === "string" ? img : img?.url;
                return (
                  <div key={idx} className="aspect-square overflow-hidden rounded-xl border bg-white">
                    {src ? (
                      <img src={src} alt={`${name} ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Product info */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-2xl font-semibold leading-tight">{name}</div>

          {shortDescription ? (
            <div className="mt-2 text-sm opacity-80">{shortDescription}</div>
          ) : null}

          {priceText ? (
            <div className="mt-4 text-xl font-semibold">{priceText}</div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
              onClick={() => alert("Hook this up to your cart flow")}
            >
              Add to cart
            </button>

            <button
              type="button"
              className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50"
              onClick={() => alert("Hook this up to your wishlist flow")}
            >
              Save
            </button>
          </div>

          {/* Optional meta */}
          <div className="mt-6 grid grid-cols-1 gap-2 text-xs opacity-75">
            {product?.BaseProductID ? (
              <div>
                Base: <span className="font-mono">{product.BaseProductID}</span>
              </div>
            ) : null}
            {Array.isArray(product?.CatalogIds) && product.CatalogIds.length ? (
              <div>
                Catalogs: <span className="font-mono">{product.CatalogIds.join(", ")}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <div className="lg:col-span-2 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Details</div>

          {htmlDescription ? (
            <div
              className="prose prose-sm max-w-none mt-3"
              // If you decide to add DOMPurify later, sanitize `htmlDescription` before injecting.
              dangerouslySetInnerHTML={{ __html: htmlDescription }}
            />
          ) : (
            <div className="mt-3 text-sm opacity-70">No description.</div>
          )}
        </div>
      </div>
    </div>
  );
}
